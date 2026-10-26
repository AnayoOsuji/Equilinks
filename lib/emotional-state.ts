import type { EmotionalState } from "@prisma/client";

export const EMOTIONAL_STATES = [
  "Settled",
  "Joyful",
  "Anxious",
  "Overwhelmed",
  "Withdrawn",
  "Frustrated",
] as const;

export type EmotionalStateLabel = (typeof EMOTIONAL_STATES)[number];

const toEnum: Record<EmotionalStateLabel, EmotionalState> = {
  Settled: "SETTLED",
  Joyful: "JOYFUL",
  Anxious: "ANXIOUS",
  Overwhelmed: "OVERWHELMED",
  Withdrawn: "WITHDRAWN",
  Frustrated: "FRUSTRATED",
};

const toLabel: Record<EmotionalState, EmotionalStateLabel> = {
  SETTLED: "Settled",
  JOYFUL: "Joyful",
  ANXIOUS: "Anxious",
  OVERWHELMED: "Overwhelmed",
  WITHDRAWN: "Withdrawn",
  FRUSTRATED: "Frustrated",
};

export const STATE_HINTS: Record<EmotionalStateLabel, string> = {
  Settled: "Calm and ready to take part",
  Joyful: "Bright, engaged, and at ease",
  Anxious: "Worried or unsettled",
  Overwhelmed: "Too much at once",
  Withdrawn: "Quiet and pulled back",
  Frustrated: "Stuck, upset, or irritated",
};

const attention = new Set<EmotionalStateLabel>(["Anxious", "Overwhelmed", "Withdrawn", "Frustrated"]);

export function isEmotionalStateLabel(value: string): value is EmotionalStateLabel {
  return (EMOTIONAL_STATES as readonly string[]).includes(value);
}

export function emotionalStateToEnum(label: EmotionalStateLabel) {
  return toEnum[label];
}

export function emotionalStateLabel(state: EmotionalState) {
  return toLabel[state];
}

export function needsAttention(state: EmotionalStateLabel | null) {
  return state !== null && attention.has(state);
}
