import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ResponsiveContainer, i as Bar, n as YAxis, o as Tooltip, r as XAxis, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sky-chart-CImefWqX.js
var import_jsx_runtime = require_jsx_runtime();
function SkyChart({ rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-52 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
				data: rows,
				barCategoryGap: "28%",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "tick",
						axisLine: false,
						tickLine: false,
						tick: {
							fill: "var(--color-muted)",
							fontSize: 12,
							fontFamily: "var(--font-sans)"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						hide: true,
						domain: [0, 100]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						cursor: { fill: "color-mix(in srgb, var(--color-brass) 12%, transparent)" },
						contentStyle: {
							background: "var(--color-card)",
							border: "1px solid var(--color-line)",
							borderRadius: 12,
							fontSize: 12,
							color: "var(--color-ink)",
							fontFamily: "var(--font-sans)"
						},
						formatter: (value, _name, item) => {
							const row = item.payload;
							return [`${row.taken} of ${row.total} logged`, `${value}%`];
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						dataKey: "pct",
						fill: "var(--color-brass)",
						radius: [
							6,
							6,
							0,
							0
						]
					})
				]
			})
		})
	});
}
//#endregion
export { SkyChart };
