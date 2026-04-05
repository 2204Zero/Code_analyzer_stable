---
title: Code Analysis RL Environment
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# Code Analysis RL Environment

A comprehensive **Reinforcement Learning (RL) environment** for analyzing code repositories, identifying issues, and generating meaningful fixes. Built as part of the **OpenEnv Hackathon**, this system uses LLM-powered agents to evaluate code quality and suggest improvements through a multi-step interactive process.

**Purpose**: Train and evaluate AI agents on their ability to:
- Detect code issues and vulnerabilities
- Suggest meaningful and actionable fixes
- Improve performance over multiple interaction steps
- Work with diverse programming languages and project types

---

## Key Capabilities

- **Custom RL Environment** (`CodeAnalysisEnv`) - Gymnasium-compatible environment with observation/action spaces
- **Intelligent Reward System** - Semantic similarity-based evaluation using difflib matching
- **Multi-Step Interaction** - Max 3 steps per episode with cumulative reward tracking
- **LLM Integration** - Multiple agent types (analyzer, issue generator, fix generator, explanation agents)
- **Full Docker Support** - Containerized deployment with all dependencies
- **OpenEnv Compatible** - Standardized interface via `openenv.yml` configuration
- **Vector Database** - ChromaDB for semantic code analysis and retrieval
- **Web Interface** - React/Next.js frontend with real-time feedback
- **Secure API** - FastAPI backend with authentication and database persistence

---

## Project Architecture

```
Agentic_AI/
├── rl/                          # PRIMARY: Reinforcement Learning Core
│   ├── env.py                   # CodeAnalysisEnv - Main RL Environment
│   ├── reward.py                # Reward computation with semantic similarity
│   ├── test_env.py              # Environment testing utilities
│   ├── __init__.py              # Package initialization
│   ├── data/
│   │   └── jobs_data.json       # Task dataset for training
│   └── tasks/
│       └── tasks.py             # Task configuration and difficulty levels
│
├── backend/                     # Backend API & Services
│   ├── main.py                  # FastAPI application entry point
│   ├── worker.py                # Async job processing worker
│   ├── export_data.py           # Data export utilities
│   ├── requirements.txt         # Backend dependencies
│   ├── jobs_data.json           # Job repository data
│   │
│   ├── agents/                  # LLM-Powered Agents
│   │   ├── analyzer_agents.py   # Code analysis agents
│   │   ├── issue_generator_agent.py  # Issue identification
│   │   ├── fixed_generator_agent.py  # Fix generation
│   │   └── explanation_agent.py      # Solution explanations
│   │
│   ├── api/                     # REST API Endpoints
│   │   └── routes.py            # FastAPI route definitions
│   │
│   ├── services/                # Business Logic Services
│   │   ├── pipeline.py          # Main processing pipeline
│   │   ├── aggregator.py        # Response aggregation
│   │   ├── llm_aggregator.py    # LLM response handling
│   │   ├── github_service.py    # GitHub integration
│   │   └── vector_store.py      # Vector database operations
│   │
│   ├── config/                  # Configuration Management
│   │   ├── settings.py          # Application settings
│   │   ├── database.py          # Database configuration
│   │   ├── redis_client.py      # Redis cache setup
│   │   └── __init__.py
│   │
│   ├── models/                  # Data Models
│   │   ├── db_models.py         # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   └── __init__.py
│   │
│   ├── repos/                   # Repository Storage
│   │   └── [Multiple project folders with source code]
│   │
│   ├── chroma_db/               # Vector Database Storage
│   │   ├── chroma.sqlite3
│   │   └── [Embedded knowledge]
│   │
│   └── utils/                   # Utility Functions
│       ├── auth.py              # Authentication utilities
│       ├── llm.py               # LLM integration helpers
│       └── __init__.py
│
├── frontend/                    # React/Next.js Web Interface
│   ├── app/
│   │   ├── page.tsx             # Main page component
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Global styles
│   │   └── HexGrid.tsx          # Interactive hex grid visualization
│   │
│   ├── components/              # Reusable React components
│   │   ├── GlowButton.tsx
│   │   └── HexGrid.tsx
│   │
│   ├── public/                  # Static assets
│   ├── package.json             # Frontend dependencies
│   ├── next.config.ts           # Next.js configuration
│   ├── tsconfig.json            # TypeScript configuration
│   └── README.md                # Frontend documentation
│
├── inference.py                 # Main inference entry point
├── openenv.yml                 # OpenEnv environment spec
├── Dockerfile                   # Docker container definition
├── requirements.txt             # Root dependencies
└── README.md                    # This file
```

---

## RL Environment Design

### Observation Space

The environment provides structured observations with the following components:

```python
{
    "task_id": str,                    # Unique task identifier
    "repository_id": str,              # Repository being analyzed
    "problem_description": str,        # Issue description
    "code_input": str,                 # Code snippet to analyze
    "difficulty_level": str,           # "easy" | "medium" | "hard"
    "steps_taken": int,                # Current step count (0-3)
    "previous_issues": list,           # Previously identified issues
    "previous_fixes": list,            # Previously suggested fixes
}
```

### Action Space

Agents must return structured JSON with identified issues and fixes:

```json
{
    "identified_issues": [
        "issue_1_description",
        "issue_2_description"
    ],
    "suggested_fixes": [
        "fix_1_description",
        "fix_2_description"
    ]
}
```

### Reward Calculation

Rewards are computed using semantic similarity matching:

```
Issue Score = (Sum of best matches to expected issues) / number of expected issues
Fix Score = (Sum of best matches to expected fixes) / number of expected fixes
Total Reward = (0.5 * Issue Score) + (0.5 * Fix Score)
Range: [0.0, 1.0]
```

The `compute_reward()` function in `rl/reward.py` implements:
- Token-level similarity using difflib
- Best-match selection per expected output
- Normalization for variable-length outputs
- Support for both string and list inputs

### Environment Flow

1. **Initialization**: Load tasks from `rl/data/jobs_data.json`
2. **Reset**: Select random task, return initial observation
3. **Step**: Agent submits action → Reward computed → Next observation returned
4. **Done**: Episode terminates after 3 steps or perfect score reached
5. **Evaluation**: Total episode reward accumulated across all steps

---

## Getting Started

### Prerequisites

- **Python 3.9+**
- **Docker & Docker Compose** (for containerized deployment)
- **Redis** (for caching, optional)
- **PostgreSQL** or SQLite (for data persistence)
- **OpenAI API key** (for LLM access)

### Installation

#### Option 1: Local Setup

```bash
# Clone the repository
git clone <repository-url>
cd Agentic_AI

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r backend/requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your API keys and database settings

# Initialize database
python backend/main.py
```

#### Option 2: Docker Deployment

```bash
# Build and run with Docker
docker build -t code-analysis-rl .
docker run -p 8000:8000 -p 3000:3000 code-analysis-rl
```

---

## Usage

### 1. Run RL Environment Training

```python
from rl.env import CodeAnalysisEnv
from rl.reward import compute_reward

# Initialize environment
env = CodeAnalysisEnv(data_path="rl/data/jobs_data.json")

# Reset for new episode
observation = env.reset()

# Agent takes action
action = {
    "identified_issues": ["memory leak", "null pointer"],
    "suggested_fixes": ["use context manager", "add null check"]
}

# Step through environment
observation, reward, done, info = env.step(action)

print(f"Reward: {reward:.2f}")
print(f"Episode Complete: {done}")
```

### 2. Test Environment

```bash
cd rl/
python test_env.py
```

### 3. Run Backend API

```bash
cd backend/
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API endpoints:
- `GET /` - Health check
- `POST /api/analyze` - Analyze code
- `GET /api/tasks` - Fetch available tasks
- `POST /api/submit` - Submit solution

### 4. Start Frontend

```bash
cd frontend/
npm install
npm run dev
```

Frontend will be available at `http://localhost:3000`

### 5. Run Full Inference Pipeline

```bash
python inference.py --task_id <task_id> --max_steps 3
```

---

## Agent Types

### 1. Analyzer Agents (`backend/agents/analyzer_agents.py`)
- Perform static code analysis
- Detect potential issues and vulnerabilities
- Generate AST-based insights
- Support multiple programming languages

### 2. Issue Generator Agent (`backend/agents/issue_generator_agent.py`)
- Identifies specific code problems
- Categorizes issues by severity (low, medium, high, critical)
- Provides context-aware descriptions
- Uses pattern matching and heuristics

### 3. Fix Generator Agent (`backend/agents/fixed_generator_agent.py`)
- Generates concrete, implementable fixes
- Prioritizes fixes by impact and feasibility
- Includes code examples and explanations
- Provides refactoring suggestions

### 4. Explanation Agent (`backend/agents/explanation_agent.py`)
- Explains identified issues in plain language
- Provides best-practice recommendations
- Generates educational content
- Links to relevant documentation

---

## Customization

### Add New Tasks

Edit `rl/tasks/tasks.py`:

```python
def get_tasks():
    return [
        {
            "id": "task_1",
            "difficulty": "easy",
            "expected_issues": ["issue1", "issue2"],
            "expected_fixes": ["fix1", "fix2"]
        }
    ]
```

### Modify Reward Function

Edit `rl/reward.py` `compute_reward()` function to change scoring logic:

```python
def compute_reward(task, action, config=None):
    # Customize reward calculation
    issue_score = calculate_issue_similarity(...)
    fix_score = calculate_fix_similarity(...)
    return (0.5 * issue_score) + (0.5 * fix_score)
```

### Add New Agents

1. Create new agent file in `backend/agents/`
2. Implement agent class with standard interface
3. Register in `backend/services/pipeline.py`
4. Add to agent initialization

---

## Evaluation Metrics

The environment tracks:

| Metric | Description |
|--------|-------------|
| **Issue Precision** | % of identified issues that are correct |
| **Issue Recall** | % of expected issues that were found |
| **Fix Quality** | Semantic similarity to expected fixes |
| **Episode Reward** | Cumulative reward across all steps |
| **Success Rate** | % of episodes reaching perfect score |
| **Efficiency** | Average steps to solve per episode |
| **Step Improvement** | Reward increase across steps |

---

## Docker Deployment

The project includes multi-stage Docker setup:

```bash
# Build image
docker build -t code-analysis-rl:latest .

# Run with environment
docker run \
  -e OPENAI_API_KEY=your_key \
  -e DATABASE_URL=postgresql://user:pass@db:5432/code_analysis \
  -p 8000:8000 \
  -p 3000:3000 \
  code-analysis-rl:latest

# Run with docker-compose
docker-compose up -d
```

---

## Key Dependencies

### Core
- `gymnasium>=0.27.0` - RL environment framework
- `openai>=1.0.0` - LLM integration

### Backend
- `fastapi==0.115.0` - Web framework
- `uvicorn==0.30.6` - ASGI server
- `sqlalchemy==2.0.32` - ORM
- `psycopg2-binary==2.9.9` - PostgreSQL adapter
- `chromadb==0.5.5` - Vector database
- `sentence-transformers==3.0.1` - Embeddings
- `redis==5.0.8` - Caching layer
- `gitpython==3.1.43` - Git operations
- `pydantic==2.8.2` - Data validation

### Frontend
- `next.js` - React framework
- `typescript` - Type safety
- `tailwindcss` - Styling (if configured)

See [requirements.txt](requirements.txt) and [backend/requirements.txt](backend/requirements.txt) for complete dependency lists.

---

## API Authentication

The backend uses JWT token-based authentication:

```python
# Login endpoint returns token
POST /api/auth/login
{
    "username": "user",
    "password": "pass"
}

# Use token in Authorization header
Authorization: Bearer <token>
```

Implemented in `backend/utils/auth.py` using:
- `passlib` for password hashing
- `python-jose` for JWT tokens
- Configurable token expiration

---

## Environment Variables

```bash
# LLM Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# Database
DATABASE_URL=postgresql://user:password@localhost/code_analysis
REDIS_URL=redis://localhost:6379/0

# Archive & Storage
GITHUB_TOKEN=ghp_...
CHROMA_PERSIST_DIR=./backend/chroma_db

# Application
DEBUG=false
LOG_LEVEL=INFO
MAX_STEPS=3
ENVIRONMENT=production
```

---

## Performance Tips

1. **Batch Processing**: Use `backend/worker.py` for async code analysis
2. **Caching**: Enable Redis in `backend/config/redis_client.py` for frequent queries
3. **Vector Search**: Pre-compute embeddings for repositories using ChromaDB
4. **Parallel Agents**: Run multiple agents concurrently with async/await
5. **Model Optimization**: Use quantized models for faster inference
6. **Database Indexing**: Add indexes to frequently queried columns
7. **Request Pooling**: Batch multiple analysis requests

---

## Testing

### Run Environment Tests

```bash
cd rl/
python -m pytest test_env.py -v
python test_env.py  # Quick test
```

### Test Reward Function

```python
from rl.reward import compute_reward

task = {
    "expected_issues": ["null pointer"],
    "expected_fixes": ["add null check"]
}

action = {
    "identified_issues": ["null pointer dereference"],
    "suggested_fixes": ["add null check before use"]
}

reward = compute_reward(task, action)
assert 0 <= reward <= 1
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Install dev dependencies
pip install -r requirements.txt pytest pytest-cov black flake8

# Run tests
pytest rl/test_env.py -v

# Format code
black backend/ rl/ frontend/

# Lint
flake8 backend/ rl/
```

### Code Standards
- Python: PEP 8 (enforced by black)
- TypeScript: ESLint configuration in `frontend/eslint.config.mjs`
- Commit messages: Conventional commits format

---

## Project Metadata

- **Framework**: Gymnasium RL + FastAPI
- **LLM Provider**: OpenAI GPT-4
- **Vector DB**: ChromaDB with Chroma SQLite
- **Frontend**: Next.js + React + TypeScript
- **Backend**: FastAPI + SQLAlchemy + Pydantic
- **Deployment**: Docker + OpenEnv
- **License**: MIT

---

## Additional Resources

- **OpenEnv Documentation**: See `openenv.yml` for environment specification
- **Frontend Details**: See [frontend/README.md](frontend/README.md) for UI/UX information
- **Agent Customization**: Check individual agent files for configuration options
- **Database Schema**: Refer to `backend/models/db_models.py` for data structure

---

## Support & Issues

- **Documentation**: See [frontend/README.md](frontend/README.md) for UI details
- **Bug Reports**: Open an issue with reproduction steps
- **Feature Requests**: Submit via discussions with use cases
- **Questions**: Check documentation first, then create an issue

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

**Built for the OpenEnv Hackathon**

Last Updated: April 2026
