export type CaseState =
  | "new_ticket"
  | "triaged"
  | "resolution_promised"
  | "follow_up"
  | "escalated"
  | "resolved";

export type CaseEvent =
  | "TRIAGE"
  | "RESOLUTION_PROMISED"
  | "FOLLOW_UP_DUE"
  | "ESCALATE"
  | "RESOLVE"
  | "REOPEN";

const transitions: Record<CaseState, Partial<Record<CaseEvent, CaseState>>> = {
  new_ticket: {
    TRIAGE: "triaged",
    RESOLUTION_PROMISED: "resolution_promised",
    ESCALATE: "escalated",
  },
  triaged: {
    RESOLUTION_PROMISED: "resolution_promised",
    FOLLOW_UP_DUE: "follow_up",
    ESCALATE: "escalated",
    RESOLVE: "resolved",
  },
  resolution_promised: {
    RESOLVE: "resolved",
    FOLLOW_UP_DUE: "follow_up",
    ESCALATE: "escalated",
  },
  follow_up: {
    RESOLUTION_PROMISED: "resolution_promised",
    ESCALATE: "escalated",
    RESOLVE: "resolved",
  },
  escalated: {
    RESOLVE: "resolved",
    REOPEN: "follow_up",
  },
  resolved: {
    REOPEN: "follow_up",
  },
};

export function applyEvent(current: CaseState, event: CaseEvent): CaseState {
  return transitions[current][event] ?? current;
}

export function allowedEvents(current: CaseState): CaseEvent[] {
  return Object.keys(transitions[current]) as CaseEvent[];
}
