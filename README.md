# PAN AI

A standalone, PAN-only AI chatbot for Indian PAN (Permanent Account Number) questions, PAN card
extraction (OCR) and PAN **format** validation.

> PAN AI checks the *format* of a PAN and reads cards with OCR. It is **not** government
> verification. For official verification use the Income Tax Department e-filing portal.

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19 + Vite + TypeScript, Ant Design, Tailwind CSS v4, Lucide, Zustand, Vitest |
| Backend  | Python 3.12, FastAPI, SQLAlchemy 2, Alembic, Pydantic Settings, pytest, ruff |
| Data     | PostgreSQL 17 + pgvector (Docker) |
| AI (later batches) | Ollama, PaddleOCR, OpenCV, PyMuPDF |

## Layout

```
pan-ai/
├── mock/                 Design reference (do not modify)
├── frontend/             React app (port 5760, proxies /api → 8760)
│   └── src/
│       ├── app/          App shell/layout + integration tests
│       ├── components/   ChatSidebar, ChatHeader, ChatComposer, ChatMessage, QuickActionCard,
│       │                 PANExtractionCard, PanValidationCard, DocumentPreview, ChatToolsPanel…
│       ├── features/
│       │   ├── chat/            ChatView, HistoryView, mock engine, synthetic demo data
│       │   ├── documents/       DocumentsView, file validation, JSON export helpers
│       │   └── pan-validation/  PAN format validator, Compare PAN Details
│       ├── hooks/        useAutoScroll, useCopy, useMediaQuery
│       ├── store/        Zustand: chatStore (in-memory chats), uiStore, appStore (API health)
│       ├── lib/ types/ theme/
├── backend/              FastAPI app (port 8760)
│   ├── app/              api/v1, core (config), db (base, session)
│   ├── alembic/          migrations (0001 enables pgvector)
│   └── tests/
├── scripts/              PowerShell helpers
└── docker-compose.yml    PostgreSQL + pgvector on 127.0.0.1:6760
```

## Prerequisites

Node.js 22+, pnpm, [uv](https://docs.astral.sh/uv/), Docker Desktop. Ollama is needed from PAN-005.

```powershell
.\scripts\check-prereqs.ps1
```

## Getting started (Windows PowerShell)

```powershell
.\scripts\setup.ps1     # installs deps, creates .env files from the examples
.\scripts\dev.ps1       # starts PostgreSQL, runs migrations, starts API + web
.\scripts\dev.ps1 -NoDb # run without Docker/PostgreSQL
```

- Web: http://127.0.0.1:5760
- API docs: http://127.0.0.1:8760/docs (disabled in production)
- Liveness: `GET /api/v1/health` · Readiness (checks DB): `GET /api/v1/health/ready`

Manual equivalents:

```powershell
docker compose up -d --wait db
cd backend;  uv run alembic upgrade head; uv run uvicorn app.main:app --reload --port 8760
cd frontend; pnpm dev
```

## Tests and quality gates

```powershell
.\scripts\test.ps1      # ruff + pytest, oxlint + vitest + typecheck/build
```

## Configuration

Settings use the `PAN_AI_` prefix — see [backend/.env.example](backend/.env.example),
[frontend/.env.example](frontend/.env.example) and [.env.example](.env.example).
In production `PAN_AI_SECRET_KEY` must be a random value of 32+ characters or the API refuses to start.

## Chatbot UI (PAN-002) — demo mode

The frontend recreates `mock/PAN AI Chatbot Dashboard Mockup.png` and is fully interactive, but
replies are produced **in the browser** by a rule-based mock engine
([mockAssistant.ts](frontend/src/features/chat/mockAssistant.ts)). Every reply carries a
**Demo response** tag and the header shows **Online · Demo** / **Offline · Demo**.

| Feature | Behaviour in demo mode |
|---|---|
| Chats | New chat, 5 synthetic sample chats, switch, search (header + Chat History), delete |
| Messages | Markdown answers, timestamps, copy, retry, loading and error states, auto-scroll |
| Attachments | JPG/PNG/WEBP/PDF up to 10 MB, drag & drop, preview, remove; other types rejected |
| Extraction | Returns a **fictional sample** (`ABCPS1234F`, RAHUL SHARMA) — nothing is read from the file until PAN-004 |
| PAN format check | Deterministic: 10 chars, `AAAAA9999A`, 4th char a known holder category. **Government verification: Not checked** |
| Export | Copy All Details, Download JSON (includes `synthetic` and `governmentVerification: "not_checked"`) |
| Scope | Non-PAN questions get a PAN-only refusal |
| Storage | In memory only — nothing is written to `localStorage`; reload restores the samples |

Type `#error` in a message to simulate a failed reply and exercise **Retry**.

## Privacy

- Use only synthetic PAN data (e.g. `ABCDE1234F`) in development and tests.
- Uploaded documents go to `backend/storage/`, which is git-ignored and never web-served.
- Private PAN uploads are never used for knowledge-base training.

## Roadmap

| Batch   | Scope | Status |
|---------|-------|--------|
| PAN-001 | Project initialization | ✅ Done |
| PAN-002 | Chatbot UI (mockup) | ✅ Done (demo mode) |
| PAN-003 | Backend API, PAN validation, auth | Next |
| PAN-004 | PAN OCR (PaddleOCR) | |
| PAN-005 | AI chat engine (Ollama) | |
| PAN-006 | PAN knowledge RAG (pgvector) | |
| PAN-007 | Persistence, encryption, audit | |
| PAN-008 | E2E tests, Docker deployment, docs | |
