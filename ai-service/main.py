from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="AgentOps AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    transcript: str
    state: str
    risk: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "agentops-ai-service"}


@app.post("/analyze")
def analyze(request: AnalyzeRequest):
    text = request.transcript.lower()

    if "production" in text or "blocked" in text or request.risk == "high":
        return {
            "summary": "Production-impact customer issue that needs urgent platform escalation.",
            "nextAction": "Escalate to on-call owner, post a status update, and track SLA every 30 minutes.",
            "sentiment": "frustrated",
            "workflowEvent": "ESCALATE",
            "policyStatus": "review_needed",
        }

    if "access" in text or "permission" in text or "workspace" in text:
        return {
            "summary": "Access or permissions issue after a workspace change.",
            "nextAction": "Run permission checks, identify the missing role, and send recovery steps.",
            "sentiment": "confused",
            "workflowEvent": "RESOLUTION_PROMISED",
            "policyStatus": "safe",
        }

    if "export" in text or "dashboard" in text or "analytics" in text:
        return {
            "summary": "Analytics workflow delay with low operational risk.",
            "nextAction": "Explain queue status, give an ETA, and set a follow-up reminder.",
            "sentiment": "calm",
            "workflowEvent": "RESOLUTION_PROMISED",
            "policyStatus": "safe",
        }

    return {
        "summary": "Customer conversation needs workflow triage and a clear next owner.",
        "nextAction": "Classify priority, assign owner, and schedule the next SLA checkpoint.",
        "sentiment": "confused",
        "workflowEvent": "TRIAGE",
        "policyStatus": "safe",
    }
