import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Activity, CheckCircle2, GitBranch, Plus, ShieldCheck, TimerReset } from "lucide-react";
import "./styles.css";

type CaseState = "new_ticket" | "triaged" | "resolution_promised" | "follow_up" | "escalated" | "resolved";
type CaseEvent = "TRIAGE" | "RESOLUTION_PROMISED" | "FOLLOW_UP_DUE" | "ESCALATE" | "RESOLVE" | "REOPEN";

type SupportCase = {
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
  allowedEvents: CaseEvent[];
  timeline: Array<{ id: string; at: string; actor: string; message: string }>;
};

const fallbackCases: SupportCase[] = [
  {
    id: "AO-2041",
    customer: "Maya Srinivasan",
    product: "CloudDesk CRM",
    priority: "medium",
    slaDue: "2026-05-13 18:00",
    state: "triaged",
    sentiment: "confused",
    transcript: "Team members cannot access the shared pipeline board after the workspace migration.",
    summary: "Workspace migration caused shared board access confusion.",
    nextAction: "Verify permissions and send recovery steps.",
    allowedEvents: ["RESOLUTION_PROMISED", "FOLLOW_UP_DUE", "ESCALATE", "RESOLVE"],
    timeline: [{ id: "t1", at: "09:10", actor: "Support Agent", message: "Initial issue captured." }],
  },
];

const stateLabel: Record<CaseState, string> = {
  new_ticket: "New ticket",
  triaged: "Triaged",
  resolution_promised: "Resolution promised",
  follow_up: "Follow-up",
  escalated: "Escalated",
  resolved: "Resolved",
};

const eventLabel: Record<CaseEvent, string> = {
  TRIAGE: "Triage",
  RESOLUTION_PROMISED: "Promise resolution",
  FOLLOW_UP_DUE: "Follow up",
  ESCALATE: "Escalate",
  RESOLVE: "Resolve",
  REOPEN: "Reopen",
};

const sampleTranscript =
  "Our production webhook retries are failing and the operations team is blocked. We need a clear update and an owner immediately.";

function App() {
  const [cases, setCases] = useState<SupportCase[]>(fallbackCases);
  const [selectedId, setSelectedId] = useState(fallbackCases[0].id);
  const [draft, setDraft] = useState({
    customer: "Riya Malhotra",
    product: "DeployPulse",
    priority: "high" as "low" | "medium" | "high",
    transcript: sampleTranscript,
  });
  const [systemStatus, setSystemStatus] = useState("Autonomous engine online");

  const selected = cases.find((item) => item.id === selectedId) ?? cases[0];

  const totals = useMemo(() => {
    return {
      active: cases.filter((item) => item.state !== "resolved").length,
      escalated: cases.filter((item) => item.state === "escalated").length,
      highPriority: cases.filter((item) => item.priority === "high").length,
    };
  }, [cases]);

  useEffect(() => {
    fetch("http://localhost:4100/cases")
      .then((response) => response.json())
      .then((data: SupportCase[]) => {
        setCases(data);
        if (data[0]) setSelectedId(data[0].id);
      })
      .catch(() => undefined);
  }, []);

  async function refreshCase(updated: SupportCase) {
    setCases((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedId(updated.id);
  }

  async function createCase() {
    setSystemStatus("Ingesting conversation and routing automatically...");
    const response = await fetch("http://localhost:4100/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const created = (await response.json()) as SupportCase;
    setCases((items) => [created, ...items]);
    setSelectedId(created.id);
    setSystemStatus("Case analyzed, routed, and stored without manual review.");
  }

  async function applyEvent(event: CaseEvent) {
    const response = await fetch(`http://localhost:4100/cases/${selected.id}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
    });
    if (!response.ok) return;
    await refreshCase((await response.json()) as SupportCase);
  }

  return (
    <main className="layout">
      <aside className="sidebar">
        <div className="brand">
          <GitBranch size={24} />
          <div>
            <strong>AgentCore</strong>
            <span>Autonomous Workflow OS</span>
          </div>
        </div>
        <div className="case-list">
          {cases.map((item) => (
            <button className={item.id === selected.id ? "case-card active" : "case-card"} key={item.id} onClick={() => setSelectedId(item.id)}>
              <span>{item.id}</span>
              <strong>{item.customer}</strong>
              <small>{stateLabel[item.state]} | {item.priority} priority</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="content">
        <header className="header">
          <div>
            <p>Agentic brain command center</p>
            <h1>{selected.customer}</h1>
          </div>
          <div className="live-status"><Activity size={18} /> {systemStatus}</div>
        </header>

        <section className="metrics">
          <div><CheckCircle2 size={20} /><span>Active workflows</span><strong>{totals.active}</strong></div>
          <div><ShieldCheck size={20} /><span>Escalated</span><strong>{totals.escalated}</strong></div>
          <div><TimerReset size={20} /><span>High priority</span><strong>{totals.highPriority}</strong></div>
        </section>

        <section className="composer">
          <div>
            <label>Customer</label>
            <input value={draft.customer} onChange={(event) => setDraft({ ...draft, customer: event.target.value })} />
          </div>
          <div>
            <label>Product</label>
            <input value={draft.product} onChange={(event) => setDraft({ ...draft, product: event.target.value })} />
          </div>
          <div>
            <label>Priority</label>
            <select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as "low" | "medium" | "high" })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <textarea value={draft.transcript} onChange={(event) => setDraft({ ...draft, transcript: event.target.value })} />
          <button onClick={createCase}><Plus size={18} /> Ingest conversation automatically</button>
        </section>

        <section className="case-detail">
          <div className="primary-panel">
            <div className="case-head">
              <div>
                <span>{selected.product}</span>
                <h2>{stateLabel[selected.state]}</h2>
              </div>
              <b className={`risk ${selected.priority}`}>{selected.priority}</b>
            </div>
            <p className="transcript">{selected.transcript}</p>
            <div className="ai-box">
              <span>Autonomous summary</span>
              <p>{selected.summary}</p>
              <span>Next action</span>
              <p>{selected.nextAction}</p>
              <span>Sentiment</span>
              <p>{selected.sentiment}</p>
            </div>
            <div className="actions">
              {selected.allowedEvents.map((event) => (
                <button key={event} onClick={() => applyEvent(event)}>{eventLabel[event]}</button>
              ))}
            </div>
          </div>

          <div className="timeline">
            <h3>Decision Timeline</h3>
            {selected.timeline.map((item) => (
              <div className="timeline-item" key={item.id}>
                <time>{item.at}</time>
                <strong>{item.actor}</strong>
                <p>{item.message}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
