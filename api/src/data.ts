import { CaseState } from "./stateMachine.js";

export type TimelineItem = {
  id: string;
  at: string;
  actor: string;
  message: string;
};

export type SupportCase = {
  id: string;
  customer: string;
  product: string;
  priority: "low" | "medium" | "high";
  slaDue: string;
  state: CaseState;
  sentiment: "calm" | "confused" | "frustrated";
  transcript: string;
  summary: string;
  nextAction: string;
  timeline: TimelineItem[];
};

export const cases: SupportCase[] = [
  {
    id: "AO-2041",
    customer: "Maya Srinivasan",
    product: "CloudDesk CRM",
    priority: "medium",
    slaDue: "2026-05-13 18:00",
    state: "triaged",
    sentiment: "confused",
    transcript:
      "The customer says team members cannot access the shared pipeline board after the workspace migration.",
    summary: "Workspace migration caused shared board access confusion.",
    nextAction: "Verify workspace permissions and send a step-by-step access recovery plan.",
    timeline: [
      { id: "t1", at: "09:10", actor: "Support Agent", message: "Initial issue captured from customer call." },
      { id: "t2", at: "09:12", actor: "Workflow", message: "Ticket moved to triaged." },
    ],
  },
  {
    id: "AO-2058",
    customer: "Dev Patel",
    product: "ShipTrack API",
    priority: "high",
    slaDue: "2026-05-12 17:30",
    state: "follow_up",
    sentiment: "frustrated",
    transcript:
      "The customer reports webhook retries are failing for production orders and their operations team is blocked.",
    summary: "Production webhook failures are blocking order operations.",
    nextAction: "Escalate to platform on-call and provide retry status every 30 minutes.",
    timeline: [
      { id: "t3", at: "11:31", actor: "Scheduler", message: "SLA follow-up triggered." },
      { id: "t4", at: "11:35", actor: "Risk Agent", message: "Production-impact risk detected." },
    ],
  },
  {
    id: "AO-2072",
    customer: "Aisha Khan",
    product: "Pulse Analytics",
    priority: "low",
    slaDue: "2026-05-15 12:00",
    state: "resolution_promised",
    sentiment: "calm",
    transcript:
      "The customer wants a clearer explanation of why dashboard exports are delayed during peak usage.",
    summary: "Customer needs explanation and ETA for delayed analytics exports.",
    nextAction: "Send export queue status and publish an ETA for the delayed report.",
    timeline: [
      { id: "t5", at: "14:02", actor: "AI Agent", message: "Resolution plan drafted for delayed export." },
    ],
  },
];

