from pydantic import BaseModel

class CodeRequest(BaseModel):
    code: str

class UserAuthRequest(BaseModel):
    email: str
    password: str

class AnalyzeRepoRequest(BaseModel):
    repo_url: str

class AskRepoRequest(BaseModel):
    repo_id: str
    question: str
    mode: str = "review"