# AgentCore OS

Agentic Brain for autonomous workflow decisions.

AgentCore OS turns customer conversations into structured workflow actions automatically. When a conversation is ingested, the backend immediately calls the Agentic Brain service, detects priority and sentiment, generates a summary, chooses the next action, moves the case through a state machine, and records every decision in a timeline.

## Highlights

- React + TypeScript dashboard
- Node.js + TypeScript API
- FastAPI Agentic Brain service
- State-machine workflow engine
- Automatic case ingestion
- Decision timeline and audit trail
- Clean product narrative for AI Engineer / SDE roles

## Workflow States

- `new_ticket`
- `triaged`
- `resolution_promised`
- `follow_up`
- `escalated`
- `resolved`

## Run Locally

Node API:

```bash
cd api
npm install
npm run dev
```

Agentic Brain service:

```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8100
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Resume Line

Built AgentCore OS, a reusable agentic brain platform using React, TypeScript, Node.js, FastAPI, AI workflow agents, state machines, and audit timelines to automatically convert customer conversations into structured workflow decisions.
