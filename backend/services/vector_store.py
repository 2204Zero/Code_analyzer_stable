from sentence_transformers import SentenceTransformer
import chromadb
import chromadb.config
from config.logging_config import logger
from langchain_text_splitters import RecursiveCharacterTextSplitter, Language

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


def get_language_from_ext(ext: str):
    mapping = {
        ".py": Language.PYTHON,
        ".js": Language.JS,
        ".ts": Language.TS,
        ".java": Language.JAVA,
        ".cpp": Language.CPP,
        ".go": Language.GO,
        ".rb": Language.RUBY,
        ".php": Language.PHP,
        ".rs": Language.RUST,
        ".html": Language.HTML,
        ".md": Language.MARKDOWN,
    }
    return mapping.get(ext)

def store_repo_chunks(repo_id: str, files: list):
    documents = []
    metadatas = []
    ids = []

    count = 0

    for file in files:
        file_path = file["file_path"]
        content = file["content"]
        
        _, ext = os.path.splitext(file_path)
        lang = get_language_from_ext(ext.lower())

        if lang:
            splitter = RecursiveCharacterTextSplitter.from_language(
                language=lang, chunk_size=1000, chunk_overlap=200
            )
        else:
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000, chunk_overlap=200
            )

        chunks = splitter.split_text(content)

        for chunk in chunks:
            documents.append(chunk)

            metadatas.append({
                "repo_id": str(repo_id),
                "filepath": file_path
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

        metadatas = results.get("metadatas", [])

        # flatten
        if documents and isinstance(documents[0], list):
            documents = documents[0]
            distances = distances[0]
            metadatas = metadatas[0]

        if not documents:
            return []

        # STEP 1: attach score and format chunk
        scored_chunks = []
        for doc, dist, meta in zip(documents, distances, metadatas):
            filepath = meta.get("filepath", "Unknown") if meta else "Unknown"
            formatted_chunk = f"// File: {filepath}\n{doc}"
            scored_chunks.append({"text": formatted_chunk, "score": dist})

        # STEP 2: filter weak chunks
        filtered = [
            c for c in scored_chunks
            if c["score"] < 2.0   # threshold (tunable)
        ]

        # STEP 3: sort (lower distance = better)
        filtered.sort(key=lambda x: x["score"])

        # STEP 4: remove duplicates
        seen = set()
        unique_chunks = []
        for c in filtered:
            if c["text"] not in seen:
                unique_chunks.append(c["text"])
                seen.add(c["text"])

        logger.info(f"Retrieved {len(unique_chunks)} high-quality chunks")

        # Select top chunks
        selected = unique_chunks[:10]

        return selected

    except Exception as e:
        logger.error(f"Error in query_repo: {str(e)}")
        return []