import { Check } from "lucide-react";
import type { PlacedDose } from "@/lib/cadence/model";
import { formatMinutes } from "@/lib/cadence/model";

type OrbitRingProps = {
  doses: PlacedDose[];
  nowMinutes: number;
  onToggle: (id: string) => void;
};

function point(minutes: number, radius: number) {
  const angle = (minutes / 1440) * Math.PI * 2 - Math.PI / 2;
  return {
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius,
  };
}

function beadRadii(doses: PlacedDose[]) {
  const order = doses
    .map((dose, index) => ({ index, shown: dose.shown }))
    .sort((a, b) => a.shown - b.shown);
  const radii = new Array<number>(doses.length).fill(33);
  for (let k = 0; k < order.length; k += 1) {
    const previous = order[k - 1];
    const near = previous ? order[k].shown - previous.shown <= 20 : false;
    const previousRadius = near && previous ? radii[previous.index] : 0;
    radii[order[k].index] = near && previousRadius === 33 ? 24 : 33;
  }
  return radii;
}

function shortTime(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const display = hour % 12 || 12;
  return `${display}${hour >= 12 ? "p" : "a"}`;
}

const beadClass: Record<PlacedDose["status"], string> = {
  taken: "border-ink bg-ink text-paper",
  open: "cadence-pulse border-brass bg-card text-brass border-2",
  soon: "border-ink bg-card text-ink",
  later: "border-line bg-card text-ink",
  slipped: "border-muted bg-paper text-muted border-dashed",
};

export function OrbitRing({ doses, nowMinutes, onToggle }: OrbitRingProps) {
  const radii = beadRadii(doses);
  const needle = point(nowMinutes, 29);
  const needleInner = point(nowMinutes, 15);
  const hours = [0, 6, 12, 18];

  return (
    <div className="ring-stage relative mx-auto aspect-square w-full max-w-sm">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Twenty-four hour ring. Midnight is at the top, noon at the bottom."
      >
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke="var(--color-line)"
          strokeWidth="0.4"
        />
        {Array.from({ length: 24 }, (_, hour) => {
          const outer = point(hour * 60, 47);
          const inner = point(hour * 60, hour % 6 === 0 ? 44.2 : 45.6);
          return (
            <line
              key={hour}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--color-muted)"
              strokeWidth={hour % 6 === 0 ? 0.7 : 0.35}
            />
          );
        })}
        {hours.map((hour) => {
          const spot = point(hour * 60, 40.5);
          return (
            <text
              key={hour}
              x={spot.x}
              y={spot.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--color-muted)"
              fontSize="3.4"
              fontFamily="var(--font-sans)"
            >
              {String(hour).padStart(2, "0")}
            </text>
          );
        })}
        <circle
          cx="50"
          cy="50"
          r="16.5"
          fill="var(--color-card)"
          stroke="var(--color-line)"
          strokeWidth="0.45"
        />
        <line
          x1={needleInner.x}
          y1={needleInner.y}
          x2={needle.x}
          y2={needle.y}
          stroke="var(--color-brass)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <circle cx={needle.x} cy={needle.y} r="1.15" fill="var(--color-brass)" />
      </svg>

      <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
        <div className="w-24 text-center">
          <p className="text-xs font-medium tracking-widest text-muted">NOW</p>
          <p className="font-display text-2xl leading-none tabular-nums">
            {formatMinutes(nowMinutes)}
          </p>
        </div>
      </div>

      {doses.map((dose, index) => {
        const spot = point(dose.shown, radii[index] ?? 33);
        return (
          <button
            key={dose.id}
            type="button"
            className={`ring-bead tap absolute top-0 left-0 z-20 grid size-11 place-items-center rounded-full border text-xs font-semibold ${beadClass[dose.status]}`}
            style={{
              transform: `translate(calc(${spot.x} * 1cqw - 50%), calc(${spot.y} * 1cqh - 50%))`,
            }}
            aria-pressed={dose.taken}
            aria-label={`${dose.taken ? "Undo" : "Log"} ${dose.name} at ${formatMinutes(dose.shown)}`}
            onClick={() => onToggle(dose.id)}
          >
            {dose.taken ? <Check className="size-4" aria-hidden="true" /> : shortTime(dose.shown)}
          </button>
        );
      })}
    </div>
  );
}
