import { useEffect, useState } from "react";
import {
  Check,
  Compass,
  Copy,
  ListChecks,
  Plane,
  Plus,
  Star,
  SunMedium,
  X,
} from "lucide-react";
import { OrbitRing } from "@/components/cadence/orbit-ring";
import {
  ANCHORS,
  CONTEXTS,
  LANDINGS,
  RITUALS,
  careSlip,
  dateKey,
  fortnight,
  formatMinutes,
  heroCopy,
  loadState,
  makeSeed,
  minutesNow,
  minutesNowFine,
  parseTimeInput,
  placeDoses,
  saveState,
  skySentence,
  toTimeInput,
  weekRows,
  whispers,
  windowCopy,
  type AnchorKind,
  type CadenceState,
  type ContextKind,
  type DayMark,
  type PlacedDose,
} from "@/lib/cadence/model";

type ViewId = "orbit" | "plan" | "sky" | "passage";
type PanelId = "notes" | "slip" | null;

const VIEWS: { id: ViewId; label: string; icon: typeof SunMedium }[] = [
  { id: "orbit", label: "Orbit", icon: SunMedium },
  { id: "plan", label: "Plan", icon: ListChecks },
  { id: "sky", label: "Sky", icon: Star },
  { id: "passage", label: "Passage", icon: Plane },
];

export function CadenceApp() {
  const [state, setState] = useState<CadenceState | null>(null);
  const [instant, setInstant] = useState<Date | null>(null);
  const [view, setView] = useState<ViewId>("orbit");
  const [panel, setPanel] = useState<PanelId>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const started = new Date();
    setInstant(started);
    setState(loadState(started));
    const timer = window.setInterval(() => setInstant(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  if (!state || !instant) {
    return (
      <main className="grid min-h-svh place-items-center bg-paper px-6 text-ink">
        <div className="text-center">
          <p className="text-xs font-medium tracking-widest text-muted">CADENCE</p>
          <h1 className="mt-3 font-display text-4xl">Setting the ring</h1>
        </div>
      </main>
    );
  }

  const clock = instant;
  const doses = placeDoses(state, clock);
  const clockMin = minutesNow(clock);
  const hero = heroCopy(doses, clockMin);
  const notes = whispers(doses);
  const slip = careSlip(state, doses, clock);
  const logged = doses.filter((dose) => dose.taken).length;

  function patch(partial: Partial<CadenceState>) {
    setState((current) => (current ? { ...current, ...partial } : current));
  }

  function toggleDose(id: string) {
    setState((current) => {
      if (!current) return current;
      const date = dateKey(clock);
      const exists = current.logs.some((entry) => entry.date === date && entry.doseId === id);
      const logs = exists
        ? current.logs.filter((entry) => !(entry.date === date && entry.doseId === id))
        : [...current.logs, { date, doseId: id }];
      return { ...current, logs };
    });
  }

  function logDue(ids: string[]) {
    setState((current) => {
      if (!current) return current;
      const date = dateKey(clock);
      const have = new Set(
        current.logs.filter((entry) => entry.date === date).map((entry) => entry.doseId),
      );
      const extra = ids
        .filter((id) => !have.has(id))
        .map((doseId) => ({ date, doseId }));
      return { ...current, logs: [...current.logs, ...extra] };
    });
  }

  function removeDose(id: string) {
    setState((current) => {
      if (!current) return current;
      return {
        ...current,
        doses: current.doses.filter((dose) => dose.id !== id),
        logs: current.logs.filter((entry) => entry.doseId !== id),
      };
    });
  }

  function addDose(draft: {
    name: string;
    amount: string;
    minutes: number;
    context: ContextKind;
    anchor: AnchorKind;
  }) {
    setState((current) => {
      if (!current) return current;
      return {
        ...current,
        doses: [
          ...current.doses,
          {
            id: crypto.randomUUID(),
            name: draft.name.trim(),
            amount: draft.amount.trim(),
            minutes: draft.minutes,
            context: draft.context,
            anchor: draft.anchor,
          },
        ],
      };
    });
    setView("orbit");
  }

  function restore() {
    const fresh = makeSeed(new Date());
    fresh.notesSeen = true;
    setState(fresh);
    setView("orbit");
    setPanel(null);
  }

  function land(place: string, hours: number, next?: ViewId) {
    patch({ place, passageHours: hours });
    if (next) setView(next);
  }

  async function copySlip() {
    try {
      await navigator.clipboard.writeText(slip);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const shiftLabel =
    state.passageHours === 0
      ? "Home clock"
      : `${state.passageHours > 0 ? "+" : ""}${state.passageHours}h from home`;

  return (
    <div className="min-h-svh bg-paper text-ink">
      <div className="mx-auto flex w-full max-w-6xl">
        <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-line px-6 py-8 md:flex">
          <Brand onNotes={() => setPanel("notes")} />
          <Nav view={view} onChange={setView} />
          <div className="mt-auto">
            <label className="text-xs font-medium text-muted" htmlFor="keeper-name">
              The ring is for
            </label>
            <input
              id="keeper-name"
              value={state.name}
              onChange={(event) => patch({ name: event.target.value.slice(0, 32) })}
              className="mt-2 h-11 w-full rounded-xl border border-line bg-card px-3 text-base outline-none"
            />
            <p className="mt-6 font-display text-lg leading-snug">For the ring, not the alarm.</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 pt-6 pb-28 md:px-10 md:pt-8 md:pb-12">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <header className="flex items-start justify-between gap-4">
              <div className="md:hidden">
                <p className="text-xs font-medium tracking-widest text-muted">CADENCE</p>
                <p className="mt-1 text-sm text-muted">Circadian care composer</p>
              </div>
              <p className="hidden text-sm text-muted md:block">
                {state.name} · {state.place || "Unnamed city"} · {shiftLabel}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="tap inline-flex h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-medium md:hidden"
                  onClick={() => setPanel("notes")}
                >
                  <Compass className="size-4" aria-hidden="true" />
                  Notes
                </button>
                <button
                  type="button"
                  className="tap inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-paper"
                  onClick={() => {
                    setCopied(false);
                    setPanel("slip");
                  }}
                >
                  <Copy className="size-4" aria-hidden="true" />
                  Care slip
                </button>
              </div>
            </header>

            {!state.notesSeen ? (
              <div className="flex flex-col gap-3 rounded-3xl border border-line bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-relaxed">
                  This is not a checklist. Cadence draws the day as a ring, then asks which doses
                  follow meals and which follow your body across cities.
                </p>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    className="tap h-11 rounded-full bg-ink px-4 text-sm font-medium text-paper"
                    onClick={() => {
                      patch({ notesSeen: true });
                      setPanel("notes");
                    }}
                  >
                    Field notes
                  </button>
                  <button
                    type="button"
                    className="tap h-11 rounded-full border border-line px-4 text-sm font-medium"
                    onClick={() => patch({ notesSeen: true })}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : null}

            {view === "orbit" ? (
              <OrbitView
                hero={hero}
                doses={doses}
                nowMinutes={minutesNowFine(clock)}
                logged={logged}
                notes={notes}
                passageHours={state.passageHours}
                onToggle={toggleDose}
                onLisbon={() => land("Lisbon", -4, "orbit")}
              />
            ) : null}
            {view === "plan" ? (
              <PlanView
                doses={doses}
                clockMin={clockMin}
                onToggle={toggleDose}
                onLogDue={logDue}
                onRemove={removeDose}
                onAdd={addDose}
              />
            ) : null}
            {view === "sky" ? <SkyView state={state} clock={clock} /> : null}
            {view === "passage" ? (
              <PassageView
                state={state}
                doses={doses}
                onLand={(place, hours) => land(place, hours)}
                onHours={(passageHours) => patch({ passageHours })}
                onPlace={(place) => patch({ place })}
                onEase={() => {
                  if (state.passageHours === 0) return;
                  const step = state.passageHours > 0 ? -1 : 1;
                  patch({ passageHours: state.passageHours + step });
                }}
                onRestore={restore}
              />
            ) : null}

            <p className="text-sm leading-relaxed text-muted">
              Cadence only organizes what you type. It does not know interactions, doses, or you.
              A pharmacist does.
            </p>
          </div>
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 backdrop-blur md:hidden"
        aria-label="Sections"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-4">
          {VIEWS.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`tap flex h-16 w-full flex-col items-center justify-center gap-1 text-xs font-medium ${active ? "text-brass" : "text-muted"}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setView(item.id)}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {panel ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 sm:items-center"
          onClick={() => setPanel(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
            className="max-h-full w-full max-w-lg overflow-y-auto rounded-3xl bg-card p-6 text-ink"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="panel-title" className="font-display text-3xl">
                {panel === "notes" ? "Field notes" : "Care slip"}
              </h2>
              <button
                type="button"
                className="tap grid size-11 place-items-center rounded-full border border-line"
                aria-label="Close"
                onClick={() => setPanel(null)}
              >
                <X className="size-5" />
              </button>
            </div>
            {panel === "notes" ? <FieldNotes onRestore={restore} /> : null}
            {panel === "slip" ? (
              <div className="mt-4 flex flex-col gap-4">
                <p className="text-sm leading-relaxed text-muted">
                  A plain note for another person, or for a translator. Nothing is uploaded.
                </p>
                <textarea
                  readOnly
                  value={slip}
                  className="min-h-64 w-full rounded-2xl border border-line bg-paper p-4 text-sm leading-relaxed"
                />
                <button
                  type="button"
                  className="tap h-12 rounded-full bg-ink text-sm font-medium text-paper"
                  onClick={() => void copySlip()}
                >
                  {copied ? "Copied" : "Copy the slip"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Brand({ onNotes }: { onNotes: () => void }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-widest text-brass">CADENCE</p>
      <h1 className="mt-3 font-display text-4xl leading-none">The day, composed.</h1>
      <button
        type="button"
        className="tap mt-5 inline-flex h-11 items-center gap-2 text-sm font-medium text-ink"
        onClick={onNotes}
      >
        <Compass className="size-4 text-brass" aria-hidden="true" />
        Field notes
      </button>
    </div>
  );
}

function Nav({ view, onChange }: { view: ViewId; onChange: (view: ViewId) => void }) {
  return (
    <nav className="mt-10" aria-label="Sections">
      <ul className="flex flex-col gap-1">
        {VIEWS.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`tap flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium ${active ? "bg-card text-ink" : "text-muted"}`}
                aria-current={active ? "page" : undefined}
                onClick={() => onChange(item.id)}
              >
                <Icon className={`size-4 ${active ? "text-brass" : ""}`} aria-hidden="true" />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function OrbitView({
  hero,
  doses,
  nowMinutes,
  logged,
  notes,
  passageHours,
  onToggle,
  onLisbon,
}: {
  hero: { title: string; body: string };
  doses: PlacedDose[];
  nowMinutes: number;
  logged: number;
  notes: string[];
  passageHours: number;
  onToggle: (id: string) => void;
  onLisbon: () => void;
}) {
  const ahead = doses.filter((dose) => dose.status === "soon" || dose.status === "later").length;
  const slipped = doses.filter((dose) => dose.status === "slipped").length;
  return (
    <section className="flex flex-col gap-6" aria-labelledby="orbit-title">
      <div>
        <h2 id="orbit-title" className="font-display text-4xl md:text-5xl">
          {hero.title}
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">{hero.body}</p>
      </div>
      <OrbitRing doses={doses} nowMinutes={nowMinutes} onToggle={onToggle} />
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted">
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-ink" aria-hidden="true" /> Logged
        </li>
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full border-2 border-brass" aria-hidden="true" /> In
          window
        </li>
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full border border-line bg-card" aria-hidden="true" />{" "}
          Ahead
        </li>
        <li className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full border border-dashed border-muted"
            aria-hidden="true"
          />{" "}
          Slipped
        </li>
      </ul>
      <dl className="grid grid-cols-3 gap-3">
        <Stat label="Logged" value={String(logged)} hint={`of ${doses.length}`} />
        <Stat label="Ahead" value={String(ahead)} hint="not yet due" />
        <Stat label="Slipped" value={String(slipped)} hint="unmarked, window shut" />
      </dl>
      {notes.map((note) => (
        <p
          key={note}
          className="rounded-3xl border border-line bg-card px-4 py-3 text-sm leading-relaxed"
        >
          {note}
        </p>
      ))}
      {passageHours === 0 ? (
        <button
          type="button"
          className="tap self-start text-sm font-medium text-brass"
          onClick={onLisbon}
        >
          Preview a landing in Lisbon. Body-clock doses slide four hours earlier.
        </button>
      ) : (
        <p className="text-sm leading-relaxed text-muted">
          Beads with a local-clock anchor stayed put. Body-clock beads moved {Math.abs(passageHours)}{" "}
          {Math.abs(passageHours) === 1 ? "hour" : "hours"}{" "}
          {passageHours < 0 ? "earlier" : "later"}.
        </p>
      )}
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-line bg-card px-4 py-4">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-2 font-display text-3xl tabular-nums">{value}</dd>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

function PlanView({
  doses,
  clockMin,
  onToggle,
  onLogDue,
  onRemove,
  onAdd,
}: {
  doses: PlacedDose[];
  clockMin: number;
  onToggle: (id: string) => void;
  onLogDue: (ids: string[]) => void;
  onRemove: (id: string) => void;
  onAdd: (draft: {
    name: string;
    amount: string;
    minutes: number;
    context: ContextKind;
    anchor: AnchorKind;
  }) => void;
}) {
  const ordered = [...doses].sort((a, b) => a.shown - b.shown);
  const groups: { ritual: PlacedDose["ritual"]; items: PlacedDose[] }[] = [];
  for (const dose of ordered) {
    const last = groups[groups.length - 1];
    if (!last || last.ritual !== dose.ritual) groups.push({ ritual: dose.ritual, items: [dose] });
    else last.items.push(dose);
  }

  return (
    <section className="flex flex-col gap-8" aria-labelledby="plan-title">
      <div>
        <p className="text-xs font-medium tracking-widest text-muted">PLAN</p>
        <h2 id="plan-title" className="mt-2 font-display text-4xl">
          Rituals, in the order the day meets them.
        </h2>
      </div>
      {groups.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
          Nothing on the ring yet. The form below is the whole plan.
        </p>
      ) : (
        groups.map((group) => {
          const due = group.items.filter(
            (dose) => !dose.taken && (dose.status === "open" || dose.status === "slipped"),
          );
          return (
            <div key={group.ritual} className="flex flex-col gap-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl">{RITUALS[group.ritual].label}</h3>
                  <p className="text-sm text-muted">{RITUALS[group.ritual].line}</p>
                </div>
                {due.length > 0 ? (
                  <button
                    type="button"
                    className="tap h-11 shrink-0 rounded-full border border-line bg-card px-4 text-sm font-medium"
                    onClick={() => onLogDue(due.map((dose) => dose.id))}
                  >
                    Log {due.length} due
                  </button>
                ) : (
                  <p className="text-xs font-medium text-muted">Nothing due unmarked</p>
                )}
              </div>
              <ul className="flex flex-col gap-3">
                {group.items.map((dose) => (
                  <DoseRow
                    key={dose.id}
                    dose={dose}
                    clockMin={clockMin}
                    onToggle={onToggle}
                    onRemove={onRemove}
                  />
                ))}
              </ul>
            </div>
          );
        })
      )}
      <Composer onAdd={onAdd} />
    </section>
  );
}

function DoseRow({
  dose,
  clockMin,
  onToggle,
  onRemove,
}: {
  dose: PlacedDose;
  clockMin: number;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <li className="rounded-3xl border border-line bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl tabular-nums">{formatMinutes(dose.shown)}</p>
          <h3 className="mt-1 text-base font-medium">{dose.name}</h3>
          <p className="mt-1 text-sm text-muted">
            {dose.amount} · {CONTEXTS[dose.context].label} · {ANCHORS[dose.anchor].label}
          </p>
          <p className="mt-1 text-sm">{windowCopy(dose.status, dose.shown, clockMin)}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={`tap h-11 rounded-full px-4 text-sm font-medium ${dose.taken ? "bg-paper text-ink" : "bg-ink text-paper"}`}
            onClick={() => onToggle(dose.id)}
          >
            {dose.taken ? "Undo" : "Log"}
          </button>
          {confirm ? (
            <button
              type="button"
              className="tap h-11 rounded-full border border-line px-4 text-sm font-medium"
              onClick={() => onRemove(dose.id)}
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              className="tap grid size-11 place-items-center rounded-full border border-line"
              aria-label={`Remove ${dose.name}`}
              onClick={() => setConfirm(true)}
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function Composer({
  onAdd,
}: {
  onAdd: (draft: {
    name: string;
    amount: string;
    minutes: number;
    context: ContextKind;
    anchor: AnchorKind;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [time, setTime] = useState("09:00");
  const [context, setContext] = useState<ContextKind>("food");
  const [anchor, setAnchor] = useState<AnchorKind>("place");

  return (
    <form
      className="flex flex-col gap-4 rounded-3xl border border-line bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!name.trim() || !amount.trim()) return;
        onAdd({
          name,
          amount,
          minutes: parseTimeInput(time),
          context,
          anchor,
        });
        setName("");
        setAmount("");
        setTime("09:00");
        setContext("food");
        setAnchor("place");
      }}
    >
      <div className="flex items-center gap-2">
        <Plus className="size-4 text-brass" aria-hidden="true" />
        <h3 className="font-display text-2xl">Add to the ring</h3>
      </div>
      <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="dose-name">
        Name
        <input
          id="dose-name"
          required
          value={name}
          maxLength={40}
          placeholder="Vitamin D"
          onChange={(event) => setName(event.target.value)}
          className="h-12 rounded-xl border border-line bg-paper px-3 text-base font-normal outline-none"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="dose-amount">
        Amount, in your words
        <input
          id="dose-amount"
          required
          value={amount}
          maxLength={48}
          placeholder="1 softgel"
          onChange={(event) => setAmount(event.target.value)}
          className="h-12 rounded-xl border border-line bg-paper px-3 text-base font-normal outline-none"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="dose-time">
        Home time
        <input
          id="dose-time"
          type="time"
          required
          value={time}
          onChange={(event) => setTime(event.target.value)}
          className="h-12 rounded-xl border border-line bg-paper px-3 text-base font-normal outline-none"
        />
      </label>
      <fieldset>
        <legend className="text-sm font-medium">How you take it</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(Object.keys(CONTEXTS) as ContextKind[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={context === key}
              className={`tap h-11 rounded-xl border px-3 text-sm ${context === key ? "border-ink bg-ink text-paper" : "border-line bg-paper"}`}
              onClick={() => setContext(key)}
            >
              {CONTEXTS[key].label}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-medium">What it follows</legend>
        <div className="mt-2 grid gap-2">
          {(Object.keys(ANCHORS) as AnchorKind[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={anchor === key}
              className={`tap rounded-xl border px-3 py-3 text-left ${anchor === key ? "border-ink bg-ink text-paper" : "border-line bg-paper"}`}
              onClick={() => setAnchor(key)}
            >
              <span className="block text-sm font-medium">{ANCHORS[key].label}</span>
              <span className={`mt-1 block text-xs ${anchor === key ? "text-paper" : "text-muted"}`}>
                {ANCHORS[key].hint}
              </span>
            </button>
          ))}
        </div>
      </fieldset>
      <button type="submit" className="tap h-12 rounded-full bg-ink text-sm font-medium text-paper">
        Place it on the ring
      </button>
      <p className="text-xs leading-relaxed text-muted">Home time is {toTimeInput(parseTimeInput(time))} on your usual clock. Passage can slide it later if you mark it body-clock.</p>
    </form>
  );
}

function SkyView({ state, clock }: { state: CadenceState; clock: Date }) {
  const marks = fortnight(state, clock);
  const rows = weekRows(marks);
  const [Chart, setChart] = useState<typeof import("./sky-chart").SkyChart | null>(null);

  useEffect(() => {
    let live = true;
    void import("./sky-chart").then((mod) => {
      if (live) setChart(() => mod.SkyChart);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <section className="flex flex-col gap-6" aria-labelledby="sky-title">
      <div>
        <p className="text-xs font-medium tracking-widest text-muted">SKY</p>
        <h2 id="sky-title" className="mt-2 font-display text-4xl">
          Fourteen days, without a streak costume.
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">{skySentence(marks)}</p>
      </div>
      <ol className="grid grid-cols-7 gap-2" aria-label="Fourteen days of logged doses">
        {marks.map((mark) => (
          <DayDot key={mark.key} mark={mark} />
        ))}
      </ol>
      <p className="text-xs text-muted">Deeper brass means more of that day was logged.</p>
      <div className="rounded-3xl border border-line bg-card p-4">
        <h3 className="font-display text-2xl">This week</h3>
        {state.doses.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Add a dose and the week will have something to measure.</p>
        ) : Chart ? (
          <Chart rows={rows} />
        ) : (
          <div className="h-52" />
        )}
      </div>
    </section>
  );
}

function DayDot({ mark }: { mark: DayMark }) {
  return (
    <li className="flex flex-col items-center gap-1 text-center">
      <span className="sr-only">
        {mark.isToday ? "Today" : mark.weekday} {mark.label}: {mark.taken} of {mark.total} logged
      </span>
      <span
        className={`grid size-9 place-items-center rounded-full border ${mark.isToday ? "border-ink" : "border-line"} bg-card`}
        aria-hidden="true"
      >
        <span className="size-5 rounded-full bg-brass" style={{ opacity: mark.pct / 100 }} />
      </span>
      <span className="text-xs text-muted" aria-hidden="true">
        {mark.isToday ? "Now" : mark.label}
      </span>
    </li>
  );
}

function PassageView({
  state,
  doses,
  onLand,
  onHours,
  onPlace,
  onEase,
  onRestore,
}: {
  state: CadenceState;
  doses: PlacedDose[];
  onLand: (place: string, hours: number) => void;
  onHours: (hours: number) => void;
  onPlace: (place: string) => void;
  onEase: () => void;
  onRestore: () => void;
}) {
  const ordered = [...doses].sort((a, b) => a.shown - b.shown);
  return (
    <section className="flex flex-col gap-6" aria-labelledby="passage-title">
      <div>
        <p className="text-xs font-medium tracking-widest text-muted">PASSAGE</p>
        <h2 id="passage-title" className="mt-2 font-display text-4xl">
          Two clocks, one landing.
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
          Your phone already shows local time. Passage does not change that clock. It moves only
          the doses you marked as body-clock, by the hours between home and here. Meal doses stay
          on the numbers printed beside breakfast.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {LANDINGS.map((landing) => {
          const active = state.place === landing.place && state.passageHours === landing.hours;
          return (
            <li key={landing.id}>
              <button
                type="button"
                aria-pressed={active}
                className={`tap h-full w-full rounded-3xl border p-4 text-left ${active ? "border-ink bg-ink text-paper" : "border-line bg-card"}`}
                onClick={() => onLand(landing.place, landing.hours)}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-2xl">{landing.place}</span>
                  <span className="text-sm tabular-nums">
                    {landing.hours > 0 ? `+${landing.hours}` : landing.hours}h
                  </span>
                </span>
                <span className={`mt-2 block text-sm leading-relaxed ${active ? "text-paper" : "text-muted"}`}>
                  {landing.blurb}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="rounded-3xl border border-line bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <label className="flex flex-1 flex-col gap-2 text-sm font-medium" htmlFor="place-name">
            City on the slip
            <input
              id="place-name"
              value={state.place}
              maxLength={32}
              onChange={(event) => onPlace(event.target.value)}
              className="h-12 rounded-xl border border-line bg-paper px-3 text-base font-normal outline-none"
            />
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="tap grid size-12 place-items-center rounded-full border border-line text-lg"
              aria-label="One hour earlier"
              onClick={() => onHours(Math.max(-12, state.passageHours - 1))}
            >
              −
            </button>
            <p className="min-w-16 text-center font-display text-3xl tabular-nums">
              {state.passageHours > 0 ? `+${state.passageHours}` : state.passageHours}
            </p>
            <button
              type="button"
              className="tap grid size-12 place-items-center rounded-full border border-line text-lg"
              aria-label="One hour later"
              onClick={() => onHours(Math.min(14, state.passageHours + 1))}
            >
              +
            </button>
          </div>
        </div>
        <button
          type="button"
          className="tap mt-4 h-11 rounded-full border border-line px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
          disabled={state.passageHours === 0}
          onClick={onEase}
        >
          Ease one hour toward home
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {ordered.map((dose) => {
          const moved = dose.anchor === "body" && state.passageHours !== 0;
          return (
            <li
              key={dose.id}
              className="grid gap-1 rounded-2xl border border-line bg-card px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <p className="font-medium">{dose.name}</p>
                <p className="text-sm text-muted">{ANCHORS[dose.anchor].label}</p>
              </div>
              <p className="text-sm tabular-nums sm:text-right">
                {moved ? (
                  <>
                    Home {formatMinutes(dose.minutes)}
                    <span className="px-2 text-muted" aria-hidden="true">
                      →
                    </span>
                    Here {formatMinutes(dose.shown)}
                  </>
                ) : (
                  <>Stays {formatMinutes(dose.shown)}</>
                )}
              </p>
            </li>
          );
        })}
      </ul>
      <button type="button" className="self-start text-sm font-medium text-muted" onClick={onRestore}>
        Restore the sample week
      </button>
    </section>
  );
}

function FieldNotes({ onRestore }: { onRestore: () => void }) {
  return (
    <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed">
      <p>
        MediGo was a list: a name, a dose, a time, and a taken flag that never rolled into tomorrow.
        Cadence keeps that list and gives the day a shape.
      </p>
      <Note
        title="The orbit"
        body="Midnight is at the top. Each dose is a bead. The brass hand is this device’s clock. A window opens 45 minutes before the dose and stays open 90 minutes after. Tap a bead to log it, tap again to undo. Logging is for this calendar date only."
      />
      <Note
        title="Two anchors"
        body="Local-clock doses stay at the same numbers in every city — vitamin with breakfast is still 8:15 beside whatever breakfast is now. Body-clock doses slide by the passage hours — a wind-down capsule follows the old evening until you ease it home."
      />
      <Note
        title="Passage"
        body="The offsets are real October gaps from Karachi: Lisbon −4, Tokyo +4, New York −9. Passage never rewrites your phone’s time. It only redraws body-clock beads against the time this device already shows. Ease one hour toward home when the jet lag actually eases. Don’t pretend a slider is a medical plan."
      />
      <Note
        title="The one whisper"
        body="If an empty-stomach dose and a with-food dose land within two hours, Cadence says so. That is the only rule. It does not know drug interactions, and it will not reschedule you."
      />
      <Note
        title="Sky and the slip"
        body="Sky is fourteen real days of what you logged, including a sample fortnight so the demo is not an empty grid. The care slip is plain text on this device. Paste it into a translator for family. Nothing leaves the browser."
      />
      <p className="flex items-start gap-2 text-muted">
        <Check className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden="true" />
        Sample doses are labels, not advice. Replace them with your own words.
      </p>
      <button type="button" className="self-start font-medium text-brass" onClick={onRestore}>
        Restore the sample week
      </button>
    </div>
  );
}

function Note({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h3 className="font-display text-xl">{title}</h3>
      <p className="mt-1 text-muted">{body}</p>
    </section>
  );
}
