import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DayMark } from "@/lib/cadence/model";

export function SkyChart({ rows }: { rows: Array<DayMark & { tick: string }> }) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} barCategoryGap="28%">
          <XAxis
            dataKey="tick"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-muted)", fontSize: 12, fontFamily: "var(--font-sans)" }}
          />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            cursor={{ fill: "color-mix(in srgb, var(--color-brass) 12%, transparent)" }}
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-line)",
              borderRadius: 12,
              fontSize: 12,
              color: "var(--color-ink)",
              fontFamily: "var(--font-sans)",
            }}
            formatter={(value, _name, item) => {
              const row = item.payload as DayMark;
              return [`${row.taken} of ${row.total} logged`, `${value}%`];
            }}
          />
          <Bar dataKey="pct" fill="var(--color-brass)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
