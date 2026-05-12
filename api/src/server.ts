import cors from "cors";
import express from "express";
import { z } from "zod";

import { cases } from "./data.js";
import { allowedEvents, applyEvent } from "./stateMachine.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT ?? 4100);
const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://127.0.0.1:8100";

const eventSchema = z.object({
  event: z.enum(["TRIAGE", "RESOLUTION_PROMISED", "FOLLOW_UP_DUE", "ESCALATE", "RESOLVE", "REOPEN"]),
});

const createCaseSchema = z.object({
  customer: z.string().min(1),
  product: z.string().min(1),
  transcript: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

type Analysis = {
  summary: string;
  nextAction: string;
  sentiment: "calm" | "confused" | "frustrated";
  workflowEvent: "TRIAGE" | "RESOLUTION_PROMISED" | "FOLLOW_UP_DUE" | "ESCALATE" | "RESOLVE";
  policyStatus: "safe" | "review_needed";
};

async function runAgenticBrain(item: (typeof cases)[number]) {
  try {
    const aiResponse = await fetch(`${AI_SERVICE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: item.transcript, state: item.state, risk: item.priority }),
    });
    if (!aiResponse.ok) throw new Error("AI service failed");
    const analysis = (await aiResponse.json()) as Analysis;

    const previous = item.state;
    item.summary = analysis.summary;
    item.nextAction = analysis.nextAction;
    item.sentiment = analysis.sentiment;
    item.state = applyEvent(item.state, analysis.workflowEvent);
    item.timeline.unshift({
      id: crypto.randomUUID(),
      at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      actor: "Autonomous Agentic Brain",
      message: `Policy ${analysis.policyStatus}. Event ${analysis.workflowEvent}. State ${previous} -> ${item.state}.`,
    });
  } catch {
    const previous = item.state;
    item.summary = "Fallback triage summary created automatically.";
    item.nextAction = "Assign an owner and schedule the next SLA checkpoint.";
    item.state = applyEvent(item.state, "TRIAGE");
    item.timeline.unshift({
      id: crypto.randomUUID(),
      at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      actor: "Autonomous Agentic Brain",
      message: `Fallback event TRIAGE. State ${previous} -> ${item.state}.`,
    });
  }
}

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "agentcore-api" });
});

app.get("/cases", (_request, response) => {
  response.json(cases.map((item) => ({ ...item, allowedEvents: allowedEvents(item.state) })));
});

app.post("/cases", async (request, response) => {
  const parsed = createCaseSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: "Invalid case payload" });

  const item = {
    id: `AC-${Math.floor(3000 + Math.random() * 6000)}`,
    customer: parsed.data.customer,
    product: parsed.data.product,
    priority: parsed.data.priority,
    slaDue: "Next business day",
    state: "new_ticket" as const,
    sentiment: "confused" as const,
    transcript: parsed.data.transcript,
    summary: "New case waiting for Agentic Brain analysis.",
    nextAction: "Run analysis to classify intent and choose the next workflow event.",
    timeline: [
      {
        id: crypto.randomUUID(),
        at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        actor: "Intake API",
        message: "Case created from customer conversation.",
      },
    ],
  };

  await runAgenticBrain(item);
  cases.unshift(item);
  response.status(201).json({ ...item, allowedEvents: allowedEvents(item.state) });
});

app.post("/cases/:id/event", (request, response) => {
  const parsed = eventSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: "Invalid event" });

  const item = cases.find((entry) => entry.id === request.params.id);
  if (!item) return response.status(404).json({ message: "Case not found" });

  const previous = item.state;
  item.state = applyEvent(item.state, parsed.data.event);
  item.timeline.unshift({
    id: crypto.randomUUID(),
    at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    actor: "State Machine",
    message: `${parsed.data.event} moved case from ${previous} to ${item.state}.`,
  });

  response.json({ ...item, allowedEvents: allowedEvents(item.state) });
});

app.post("/cases/:id/analyze", async (request, response) => {
  const item = cases.find((entry) => entry.id === request.params.id);
  if (!item) return response.status(404).json({ message: "Case not found" });

  await runAgenticBrain(item);

  response.json({ ...item, allowedEvents: allowedEvents(item.state) });
});

app.listen(PORT, () => {
  console.log(`AgentCore API running on http://localhost:${PORT}`);
});
