export const INCIDENT_MOODS = [
  { id: "CALM", label: "Calm", emoji: "😌" },
  { id: "FOCUSED", label: "Focused", emoji: "🎯" },
  { id: "HAPPY", label: "Happy", emoji: "😊" },
  { id: "ANXIOUS", label: "Anxious", emoji: "😰" },
  { id: "ELEVATED", label: "Elevated", emoji: "⚡" },
  { id: "NEED_BREAK", label: "Need break", emoji: "🛑" },
] as const;

export const ENERGY_LEVELS = [
  { id: "LOW", label: "Low", emoji: "🪫" },
  { id: "MODERATE", label: "Moderate", emoji: "🔋" },
  { id: "HIGH", label: "High", emoji: "🚀" },
] as const;

export const ACTIVITY_CONTEXTS = [
  { id: "MORNING_ARRIVAL", label: "Morning arrival", emoji: "🌅" },
  { id: "READING_CIRCLE", label: "Reading circle", emoji: "📚" },
  { id: "GYM_CLASS", label: "Gym class", emoji: "🏀" },
  { id: "MATH_STEM", label: "Math/STEM", emoji: "🔬" },
  { id: "LUNCH_RECESS", label: "Lunch & recess", emoji: "🍎" },
  { id: "ART_MUSIC", label: "Art & music", emoji: "🎨" },
  { id: "BUS_RIDE", label: "Bus ride", emoji: "🚌" },
] as const;

export type IncidentMoodId = (typeof INCIDENT_MOODS)[number]["id"];
export type EnergyLevelId = (typeof ENERGY_LEVELS)[number]["id"];
export type ActivityContextId = (typeof ACTIVITY_CONTEXTS)[number]["id"];

export function isIncidentMood(value: string): value is IncidentMoodId {
  return INCIDENT_MOODS.some((option) => option.id === value);
}

export function isEnergyLevel(value: string): value is EnergyLevelId {
  return ENERGY_LEVELS.some((option) => option.id === value);
}

export function isActivityContext(value: string): value is ActivityContextId {
  return ACTIVITY_CONTEXTS.some((option) => option.id === value);
}
