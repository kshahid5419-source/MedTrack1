import { addDays, format } from "date-fns";

export const DAY = 1440;
export const OPEN_BEFORE = 45;
export const OPEN_AFTER = 90;
const STORAGE_KEY = "cadence.atlas.v1";

export type ContextKind = "empty" | "food" | "water" | "sleep";
export type AnchorKind = "place" | "body";
export type RitualId = "first" | "high" | "golden" | "quiet";
export type DoseStatus = "taken" | "open" | "soon" | "later" | "slipped";

export type Dose = {
  id: string;
  name: string;
  amount: string;
  /** Minutes from midnight on the home clock, before any passage shift. */
  minutes: number;
  context: ContextKind;
  anchor: AnchorKind;
};

export type LogEntry = {
  date: string;
  doseId: string;
};

export type CadenceState = {
  name: string;
  place: string;
  passageHours: number;
  doses: Dose[];
  logs: LogEntry[];
  notesSeen: boolean;
};

export type PlacedDose = Dose & {
  shown: number;
  taken: boolean;
  status: DoseStatus;
  ritual: RitualId;
};

export const CONTEXTS: Record<ContextKind, { label: string; hint: string }> = {
  empty: { label: "Empty stomach", hint: "Before food" },
  food: { label: "With food", hint: "Alongside a meal" },
  water: { label: "With water", hint: "A full glass" },
  sleep: { label: "Wind-down", hint: "As the day closes" },
};

export const ANCHORS: Record<AnchorKind, { label: string; hint: string }> = {
  place: {
    label: "Local clock",
    hint: "Stays on the same numbers in every city. Meals and daylight.",
  },
  body: {
    label: "Body clock",
    hint: "Slides by the hours you traveled. Sleep and the old morning.",
  },
};

export const RITUALS: Record<RitualId, { label: string; line: string }> = {
  first: { label: "First light", line: "Just after waking" },
  high: { label: "High day", line: "The middle, around meals" },
  golden: { label: "Golden hour", line: "Late light" },
  quiet: { label: "Quiet hours", line: "Wind-down and the small hours" },
};

export const RITUAL_ORDER: RitualId[] = ["quiet", "first", "high", "golden"];

export const LANDINGS = [
  {
    id: "home",
    place: "Karachi",
    hours: 0,
    blurb: "Home. Body clock and city clock agree.",
  },
  {
    id: "lisbon",
    place: "Lisbon",
    hours: -4,
    blurb: "October offset from Karachi. Westbound four hours.",
  },
  {
    id: "tokyo",
    place: "Tokyo",
    hours: 4,
    blurb: "Eastbound four hours. Body-clock doses move later.",
  },
  {
    id: "newyork",
    place: "New York",
    hours: -9,
    blurb: "A long westbound jump, using October clocks.",
  },
] as const;

const ATLAS: Dose[] = [
  {
    id: "morning-tablet",
    name: "Morning tablet",
    amount: "As labeled, before food",
    minutes: 6 * 60 + 30,
    context: "empty",
    anchor: "body",
  },
  {
    id: "vitamin-d",
    name: "Vitamin D",
    amount: "1 softgel",
    minutes: 8 * 60 + 15,
    context: "food",
    anchor: "place",
  },
  {
    id: "probiotic",
    name: "Probiotic",
    amount: "1 capsule",
    minutes: 8 * 60 + 20,
    context: "food",
    anchor: "place",
  },
  {
    id: "omega",
    name: "Omega-3",
    amount: "1 capsule with lunch",
    minutes: 13 * 60 + 30,
    context: "food",
    anchor: "place",
  },
  {
    id: "magnesium",
    name: "Magnesium",
    amount: "1 capsule",
    minutes: 21 * 60 + 45,
    context: "sleep",
    anchor: "body",
  },
];

export function wrapMinutes(value: number) {
  return ((value % DAY) + DAY) % DAY;
}

export function dateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function minutesNow(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

export function minutesNowFine(date: Date) {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

export function formatMinutes(total: number) {
  const value = wrapMinutes(Math.round(total));
  const hour = Math.floor(value / 60);
  const mins = value % 60;
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 || 12;
  return `${display}:${String(mins).padStart(2, "0")} ${suffix}`;
}

export function formatClock(total: number) {
  const value = wrapMinutes(Math.round(total));
  const hour = Math.floor(value / 60);
  const mins = value % 60;
  return `${String(hour).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function shownMinutes(dose: Dose, passageHours: number) {
  if (dose.anchor === "place") return dose.minutes;
  return wrapMinutes(dose.minutes + passageHours * 60);
}

export function ritualOf(minutes: number): RitualId {
  if (minutes >= 300 && minutes < 660) return "first";
  if (minutes >= 660 && minutes < 1020) return "high";
  if (minutes >= 1020 && minutes < 1260) return "golden";
  return "quiet";
}

export function statusOf(shown: number, now: number): DoseStatus {
  if (now < shown - OPEN_BEFORE) {
    return shown - now <= 240 ? "soon" : "later";
  }
  if (now <= shown + OPEN_AFTER) return "open";
  return "slipped";
}

export function placeDoses(state: CadenceState, now: Date): PlacedDose[] {
  const key = dateKey(now);
  const nowMin = minutesNow(now);
  const taken = new Set(
    state.logs.filter((entry) => entry.date === key).map((entry) => entry.doseId),
  );

  return state.doses.map((dose) => {
    const shown = shownMinutes(dose, state.passageHours);
    const isTaken = taken.has(dose.id);
    return {
      ...dose,
      shown,
      taken: isTaken,
      status: isTaken ? "taken" : statusOf(shown, nowMin),
      ritual: ritualOf(shown),
    };
  });
}

export function windowCopy(status: DoseStatus, shown: number, now: number) {
  if (status === "taken") return "Logged for today.";
  if (status === "open") {
    const left = shown + OPEN_AFTER - now;
    return left > 0 ? `Window open for ${left} more min.` : "Window open.";
  }
  if (status === "soon" || status === "later") {
    const mins = Math.max(0, shown - now);
    const hours = Math.floor(mins / 60);
    const rest = mins % 60;
    if (hours <= 0) return `Due in ${rest} min.`;
    if (rest === 0) return `Due in ${hours}h.`;
    return `Due in ${hours}h ${rest}m.`;
  }
  const ago = Math.max(0, now - (shown + OPEN_AFTER));
  if (ago < 60) return `Window closed ${ago} min ago. Log it if you took it.`;
  const hours = Math.floor(ago / 60);
  return `Window closed ${hours}h ago. Log it if you took it.`;
}

export function whispers(doses: PlacedDose[]) {
  const sorted = [...doses].sort((a, b) => a.shown - b.shown);
  const lines: string[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = i + 1; j < sorted.length; j += 1) {
      const gap = sorted[j].shown - sorted[i].shown;
      if (gap > 120) break;
      const pair = new Set([sorted[i].context, sorted[j].context]);
      if (pair.has("empty") && pair.has("food")) {
        lines.push(
          `${sorted[i].name} and ${sorted[j].name} land ${gap} min apart, and one wants an empty stomach. Many labels ask for a gap. Ask a pharmacist before you move either — Cadence will not move them for you.`,
        );
      }
    }
  }
  return lines.slice(0, 2);
}

export type DayMark = {
  key: string;
  label: string;
  weekday: string;
  taken: number;
  total: number;
  pct: number;
  isToday: boolean;
};

export function fortnight(state: CadenceState, today: Date): DayMark[] {
  const total = state.doses.length;
  const marks: DayMark[] = [];
  for (let ago = 13; ago >= 0; ago -= 1) {
    const date = addDays(today, -ago);
    const key = dateKey(date);
    const taken = state.doses.filter((dose) =>
      state.logs.some((entry) => entry.date === key && entry.doseId === dose.id),
    ).length;
    marks.push({
      key,
      label: format(date, "d"),
      weekday: format(date, "EEEEE"),
      taken,
      total,
      pct: total === 0 ? 0 : Math.round((taken / total) * 100),
      isToday: ago === 0,
    });
  }
  return marks;
}

export function weekRows(marks: DayMark[]) {
  return marks.slice(-7).map((mark) => ({
    ...mark,
    tick: mark.isToday ? "Today" : mark.weekday,
  }));
}

export function skySentence(marks: DayMark[]) {
  const past = marks.filter((mark) => !mark.isToday);
  if (past.length === 0 || past.every((mark) => mark.total === 0)) {
    return "The sky fills once a few days have been logged.";
  }
  const avg = Math.round(past.reduce((sum, mark) => sum + mark.pct, 0) / past.length);
  const worst = [...past].sort((a, b) => a.pct - b.pct)[0];
  if (!worst) return "The sky fills once a few days have been logged.";
  if (avg === 100) return "Every dose in the last two weeks was logged.";
  return `About ${avg}% of doses were logged across the previous days. The thinnest was the ${worst.weekday} on the ${worst.label}.`;
}

export function heroCopy(doses: PlacedDose[], nowMin: number) {
  if (doses.length === 0) {
    return {
      title: "The ring is empty.",
      body: "Add a dose in Plan. It takes a seat on the clock instead of a row in a list.",
    };
  }
  const open = doses
    .filter((dose) => dose.status === "open")
    .sort((a, b) => a.shown - b.shown);
  if (open[0]) {
    return {
      title: `${open[0].name} is in its window.`,
      body: windowCopy("open", open[0].shown, nowMin),
    };
  }
  const ahead = doses
    .filter((dose) => dose.status === "soon" || dose.status === "later")
    .sort((a, b) => a.shown - b.shown);
  const slipped = doses
    .filter((dose) => dose.status === "slipped")
    .sort((a, b) => b.shown - a.shown);
  if (ahead[0] && slipped.length === 0) {
    return {
      title: `Next is ${ahead[0].name}.`,
      body: windowCopy(ahead[0].status, ahead[0].shown, nowMin),
    };
  }
  if (ahead[0] && slipped.length > 0) {
    const word = slipped.length === 1 ? "dose is" : "doses are";
    return {
      title: `Next is ${ahead[0].name}.`,
      body: `${slipped.length} earlier ${word} still unmarked. ${windowCopy(ahead[0].status, ahead[0].shown, nowMin)}`,
    };
  }
  if (slipped.length > 0) {
    const word = slipped.length === 1 ? "dose slipped" : "doses slipped";
    return {
      title: `${slipped.length} ${word} the window.`,
      body: "Log one if you took it. Cadence does not assume.",
    };
  }
  return {
    title: "The day is logged.",
    body: "Nothing left on the ring until the date changes.",
  };
}

export function careSlip(state: CadenceState, doses: PlacedDose[], now: Date) {
  const shift =
    state.passageHours === 0
      ? "Home clock"
      : `${state.passageHours > 0 ? "+" : ""}${state.passageHours}h from home`;
  const lines = [
    "CADENCE care slip",
    `${state.name} · ${format(now, "EEEE d MMMM yyyy")}`,
    `${state.place || "Unnamed city"} · ${shift}`,
    "",
    ...[...doses]
      .sort((a, b) => a.shown - b.shown)
      .map((dose) => {
        const here = formatMinutes(dose.shown);
        const home =
          dose.anchor === "body" && state.passageHours !== 0
            ? ` (home ${formatMinutes(dose.minutes)})`
            : "";
        const mark = dose.taken ? "logged" : dose.status;
        return `${here}${home}  ${dose.name} — ${dose.amount} — ${CONTEXTS[dose.context].label} — ${ANCHORS[dose.anchor].label} — ${mark}`;
      }),
    "",
    "Personal note only. Not a prescription, not a medical record.",
    "Paste into a translator if someone else keeps an eye on the day.",
  ];
  return lines.join("\n");
}

function missed(ago: number, dose: Dose) {
  if (ago === 4 && dose.id === "magnesium") return true;
  if (ago === 6 && dose.id === "omega") return true;
  if (ago === 9 && (dose.id === "morning-tablet" || dose.id === "omega")) return true;
  if (ago === 11 && dose.anchor === "body") return true;
  if (ago === 2 && dose.id === "probiotic") return true;
  return false;
}

export function makeSeed(now = new Date()): CadenceState {
  const logs: LogEntry[] = [];
  for (let ago = 13; ago >= 1; ago -= 1) {
    const key = dateKey(addDays(now, -ago));
    for (const dose of ATLAS) {
      if (!missed(ago, dose)) logs.push({ date: key, doseId: dose.id });
    }
  }
  const today = dateKey(now);
  const nowMin = minutesNow(now);
  for (const dose of ATLAS) {
    if (nowMin > dose.minutes + OPEN_AFTER) {
      logs.push({ date: today, doseId: dose.id });
    }
  }
  return {
    name: "Bruce",
    place: "Karachi",
    passageHours: 0,
    doses: ATLAS.map((dose) => ({ ...dose })),
    logs,
    notesSeen: false,
  };
}

function isDose(value: unknown): value is Dose {
  if (!value || typeof value !== "object") return false;
  const dose = value as Dose;
  return (
    typeof dose.id === "string" &&
    typeof dose.name === "string" &&
    typeof dose.amount === "string" &&
    typeof dose.minutes === "number" &&
    (dose.context === "empty" ||
      dose.context === "food" ||
      dose.context === "water" ||
      dose.context === "sleep") &&
    (dose.anchor === "place" || dose.anchor === "body")
  );
}

export function loadState(now = new Date()): CadenceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeSeed(now);
    const parsed = JSON.parse(raw) as Partial<CadenceState>;
    if (!parsed || !Array.isArray(parsed.doses) || !Array.isArray(parsed.logs)) {
      return makeSeed(now);
    }
    const doses = parsed.doses.filter(isDose);
    return {
      name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name : "Bruce",
      place: typeof parsed.place === "string" ? parsed.place : "Karachi",
      passageHours:
        typeof parsed.passageHours === "number"
          ? Math.max(-12, Math.min(14, Math.round(parsed.passageHours)))
          : 0,
      doses,
      logs: parsed.logs.filter(
        (entry): entry is LogEntry =>
          !!entry &&
          typeof entry === "object" &&
          typeof (entry as LogEntry).date === "string" &&
          typeof (entry as LogEntry).doseId === "string",
      ),
      notesSeen: Boolean(parsed.notesSeen),
    };
  } catch {
    return makeSeed(now);
  }
}

export function saveState(state: CadenceState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function parseTimeInput(value: string) {
  const [h, m] = value.split(":");
  const hour = Number(h);
  const mins = Number(m);
  if (!Number.isFinite(hour) || !Number.isFinite(mins)) return 8 * 60;
  return wrapMinutes(hour * 60 + mins);
}

export function toTimeInput(minutes: number) {
  return formatClock(minutes);
}
