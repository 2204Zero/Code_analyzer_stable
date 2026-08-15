from sentence_transformers import SentenceTransformer
import chromadb
import chromadb.config
from config.logging_config import logger

_model = None

import os
from pathlib import Path

CHROMA_DIR = str(Path(__file__).resolve().parent.parent / "chroma_db")

# init chroma
client = chromadb.PersistentClient(
    path=CHROMA_DIR,
    settings=chromadb.config.Settings(anonymized_telemetry=False)
)
collection = client.get_or_create_collection(name="repo_chunks")

def get_model():
    global _model
    if _model is None:
        try:
            _model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            raise RuntimeError("Embedding model unavailable. Backend could not load sentence-transformers/all-MiniLM-L6-v2. Check internet connection or local model cache.") from e
    return _model


def chunk_text(text, chunk_size=40, overlap=10):
    lines = text.split("\n")
    chunks = []

    start = 0
    while start < len(lines):
        end = start + chunk_size
        chunk_lines = lines[start:end]

        chunk = "\n".join(chunk_lines)

        if chunk.strip():
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks


def store_repo_chunks(repo_id: str, files: list):
    documents = []
    metadatas = []
    ids = []

    count = 0

    for file in files:
        file_path = file["file_path"]
        content = file["content"]

        # ADD FULL FILE AS ONE DOCUMENT
        documents.append(f"FULL FILE: {file_path}\n\n{content}")

        metadatas.append({
            "repo_id": str(repo_id),
            "file_path": file_path
        })

        ids.append(f"{repo_id}_full_{count}")
        count += 1
        chunks = chunk_text(content)

        for chunk in chunks:
            # ADD FILE CONTEXT (IMPORTANT FIX)
            doc = f"FILE: {file_path}\n\n{chunk}"

            documents.append(doc)

            metadatas.append({
                "repo_id": str(repo_id),  # ensure string consistency
                "file_path": file_path
            })

            ids.append(f"{repo_id}_{count}")
            count += 1

    if documents:
        model = get_model()
        embeddings = model.encode(documents).tolist()

        collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )

    logger.info(f"Stored {len(documents)} chunks for repo {repo_id}")

def query_repo(repo_id: str, query: str, top_k: int = 10):
    try:
        model = get_model()
        query_embedding = model.encode([query]).tolist()[0]

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where={"repo_id": repo_id},
            include=["documents", "distances", "metadatas"]
        )

        documents = results.get("documents", [])
        distances = results.get("distances", [])

        # flatten
        if documents and isinstance(documents[0], list):
            documents = documents[0]
            distances = distances[0]

        if not documents:
            return []

        # STEP 1: attach score
        scored_chunks = [
            {"text": doc, "score": dist}
            for doc, dist in zip(documents, distances)
        ]

        # STEP 2: filter weak chunks
        filtered = [
            c for c in scored_chunks
            if c["score"] < 2.0   # threshold (tunable)
        ]

        # STEP 3: sort (lower distance = better)
        filtered.sort(key=lambda x: x["score"])
        # BOOST chunks containing important keywords
        priority_chunks = []
        normal_chunks = []

        for c in filtered:
            text = c["text"].lower()

            if any(keyword in text for keyword in [
                "drivermanager",
                "getconnection",
                "password",
                "jdbc"
            ]):
                priority_chunks.append(c)
            else:
                normal_chunks.append(c)

        # combine (priority first)
        filtered = priority_chunks + normal_chunks

        # STEP 4: remove duplicates
        seen = set()
        unique_chunks = []
        for c in filtered:
            if c["text"] not in seen:
                unique_chunks.append(c["text"])
                seen.add(c["text"])

        logger.info(f"Retrieved {len(unique_chunks)} high-quality chunks")

        # STEP 1: normal retrieval
        selected = unique_chunks[:10]

        # STEP 2: FORCE ADD DB-related chunks (keyword fallback)
        all_docs = collection.get(where={"repo_id": repo_id}).get("documents", [])

        extra = []
        for doc in all_docs:
            text = doc.lower()
            if any(k in text for k in ["drivermanager", "getconnection", "jdbc"]):
                if doc not in selected:
                    extra.append(doc)

        # add limited extra
        selected += extra[:5]

        return selected

    except Exception as e:
        logger.error(f"Error in query_repo: {str(e)}")
        return []