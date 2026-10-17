import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Plus, c as Copy, i as Star, l as Compass, o as Plane, r as SunMedium, s as ListChecks, t as X, u as Check } from "../_libs/lucide-react.mjs";
import { n as addDays, t as format } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B2-YRxH3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DAY = 1440;
var STORAGE_KEY = "cadence.atlas.v1";
var CONTEXTS = {
	empty: {
		label: "Empty stomach",
		hint: "Before food"
	},
	food: {
		label: "With food",
		hint: "Alongside a meal"
	},
	water: {
		label: "With water",
		hint: "A full glass"
	},
	sleep: {
		label: "Wind-down",
		hint: "As the day closes"
	}
};
var ANCHORS = {
	place: {
		label: "Local clock",
		hint: "Stays on the same numbers in every city. Meals and daylight."
	},
	body: {
		label: "Body clock",
		hint: "Slides by the hours you traveled. Sleep and the old morning."
	}
};
var RITUALS = {
	first: {
		label: "First light",
		line: "Just after waking"
	},
	high: {
		label: "High day",
		line: "The middle, around meals"
	},
	golden: {
		label: "Golden hour",
		line: "Late light"
	},
	quiet: {
		label: "Quiet hours",
		line: "Wind-down and the small hours"
	}
};
var LANDINGS = [
	{
		id: "home",
		place: "Karachi",
		hours: 0,
		blurb: "Home. Body clock and city clock agree."
	},
	{
		id: "lisbon",
		place: "Lisbon",
		hours: -4,
		blurb: "October offset from Karachi. Westbound four hours."
	},
	{
		id: "tokyo",
		place: "Tokyo",
		hours: 4,
		blurb: "Eastbound four hours. Body-clock doses move later."
	},
	{
		id: "newyork",
		place: "New York",
		hours: -9,
		blurb: "A long westbound jump, using October clocks."
	}
];
var ATLAS = [
	{
		id: "morning-tablet",
		name: "Morning tablet",
		amount: "As labeled, before food",
		minutes: 390,
		context: "empty",
		anchor: "body"
	},
	{
		id: "vitamin-d",
		name: "Vitamin D",
		amount: "1 softgel",
		minutes: 495,
		context: "food",
		anchor: "place"
	},
	{
		id: "probiotic",
		name: "Probiotic",
		amount: "1 capsule",
		minutes: 500,
		context: "food",
		anchor: "place"
	},
	{
		id: "omega",
		name: "Omega-3",
		amount: "1 capsule with lunch",
		minutes: 810,
		context: "food",
		anchor: "place"
	},
	{
		id: "magnesium",
		name: "Magnesium",
		amount: "1 capsule",
		minutes: 1305,
		context: "sleep",
		anchor: "body"
	}
];
function wrapMinutes(value) {
	return (value % DAY + DAY) % DAY;
}
function dateKey(date) {
	return format(date, "yyyy-MM-dd");
}
function minutesNow(date) {
	return date.getHours() * 60 + date.getMinutes();
}
function minutesNowFine(date) {
	return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}
function formatMinutes(total) {
	const value = wrapMinutes(Math.round(total));
	const hour = Math.floor(value / 60);
	const mins = value % 60;
	const suffix = hour >= 12 ? "PM" : "AM";
	return `${hour % 12 || 12}:${String(mins).padStart(2, "0")} ${suffix}`;
}
function formatClock(total) {
	const value = wrapMinutes(Math.round(total));
	const hour = Math.floor(value / 60);
	const mins = value % 60;
	return `${String(hour).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}
function shownMinutes(dose, passageHours) {
	if (dose.anchor === "place") return dose.minutes;
	return wrapMinutes(dose.minutes + passageHours * 60);
}
function ritualOf(minutes) {
	if (minutes >= 300 && minutes < 660) return "first";
	if (minutes >= 660 && minutes < 1020) return "high";
	if (minutes >= 1020 && minutes < 1260) return "golden";
	return "quiet";
}
function statusOf(shown, now) {
	if (now < shown - 45) return shown - now <= 240 ? "soon" : "later";
	if (now <= shown + 90) return "open";
	return "slipped";
}
function placeDoses(state, now) {
	const key = dateKey(now);
	const nowMin = minutesNow(now);
	const taken = new Set(state.logs.filter((entry) => entry.date === key).map((entry) => entry.doseId));
	return state.doses.map((dose) => {
		const shown = shownMinutes(dose, state.passageHours);
		const isTaken = taken.has(dose.id);
		return {
			...dose,
			shown,
			taken: isTaken,
			status: isTaken ? "taken" : statusOf(shown, nowMin),
			ritual: ritualOf(shown)
		};
	});
}
function windowCopy(status, shown, now) {
	if (status === "taken") return "Logged for today.";
	if (status === "open") {
		const left = shown + 90 - now;
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
	const ago = Math.max(0, now - (shown + 90));
	if (ago < 60) return `Window closed ${ago} min ago. Log it if you took it.`;
	return `Window closed ${Math.floor(ago / 60)}h ago. Log it if you took it.`;
}
function whispers(doses) {
	const sorted = [...doses].sort((a, b) => a.shown - b.shown);
	const lines = [];
	for (let i = 0; i < sorted.length; i += 1) for (let j = i + 1; j < sorted.length; j += 1) {
		const gap = sorted[j].shown - sorted[i].shown;
		if (gap > 120) break;
		const pair = /* @__PURE__ */ new Set([sorted[i].context, sorted[j].context]);
		if (pair.has("empty") && pair.has("food")) lines.push(`${sorted[i].name} and ${sorted[j].name} land ${gap} min apart, and one wants an empty stomach. Many labels ask for a gap. Ask a pharmacist before you move either — Cadence will not move them for you.`);
	}
	return lines.slice(0, 2);
}
function fortnight(state, today) {
	const total = state.doses.length;
	const marks = [];
	for (let ago = 13; ago >= 0; ago -= 1) {
		const date = addDays(today, -ago);
		const key = dateKey(date);
		const taken = state.doses.filter((dose) => state.logs.some((entry) => entry.date === key && entry.doseId === dose.id)).length;
		marks.push({
			key,
			label: format(date, "d"),
			weekday: format(date, "EEEEE"),
			taken,
			total,
			pct: total === 0 ? 0 : Math.round(taken / total * 100),
			isToday: ago === 0
		});
	}
	return marks;
}
function weekRows(marks) {
	return marks.slice(-7).map((mark) => ({
		...mark,
		tick: mark.isToday ? "Today" : mark.weekday
	}));
}
function skySentence(marks) {
	const past = marks.filter((mark) => !mark.isToday);
	if (past.length === 0 || past.every((mark) => mark.total === 0)) return "The sky fills once a few days have been logged.";
	const avg = Math.round(past.reduce((sum, mark) => sum + mark.pct, 0) / past.length);
	const worst = [...past].sort((a, b) => a.pct - b.pct)[0];
	if (!worst) return "The sky fills once a few days have been logged.";
	if (avg === 100) return "Every dose in the last two weeks was logged.";
	return `About ${avg}% of doses were logged across the previous days. The thinnest was the ${worst.weekday} on the ${worst.label}.`;
}
function heroCopy(doses, nowMin) {
	if (doses.length === 0) return {
		title: "The ring is empty.",
		body: "Add a dose in Plan. It takes a seat on the clock instead of a row in a list."
	};
	const open = doses.filter((dose) => dose.status === "open").sort((a, b) => a.shown - b.shown);
	if (open[0]) return {
		title: `${open[0].name} is in its window.`,
		body: windowCopy("open", open[0].shown, nowMin)
	};
	const ahead = doses.filter((dose) => dose.status === "soon" || dose.status === "later").sort((a, b) => a.shown - b.shown);
	const slipped = doses.filter((dose) => dose.status === "slipped").sort((a, b) => b.shown - a.shown);
	if (ahead[0] && slipped.length === 0) return {
		title: `Next is ${ahead[0].name}.`,
		body: windowCopy(ahead[0].status, ahead[0].shown, nowMin)
	};
	if (ahead[0] && slipped.length > 0) {
		const word = slipped.length === 1 ? "dose is" : "doses are";
		return {
			title: `Next is ${ahead[0].name}.`,
			body: `${slipped.length} earlier ${word} still unmarked. ${windowCopy(ahead[0].status, ahead[0].shown, nowMin)}`
		};
	}
	if (slipped.length > 0) {
		const word = slipped.length === 1 ? "dose slipped" : "doses slipped";
		return {
			title: `${slipped.length} ${word} the window.`,
			body: "Log one if you took it. Cadence does not assume."
		};
	}
	return {
		title: "The day is logged.",
		body: "Nothing left on the ring until the date changes."
	};
}
function careSlip(state, doses, now) {
	const shift = state.passageHours === 0 ? "Home clock" : `${state.passageHours > 0 ? "+" : ""}${state.passageHours}h from home`;
	return [
		"CADENCE care slip",
		`${state.name} · ${format(now, "EEEE d MMMM yyyy")}`,
		`${state.place || "Unnamed city"} · ${shift}`,
		"",
		...[...doses].sort((a, b) => a.shown - b.shown).map((dose) => {
			const here = formatMinutes(dose.shown);
			const home = dose.anchor === "body" && state.passageHours !== 0 ? ` (home ${formatMinutes(dose.minutes)})` : "";
			const mark = dose.taken ? "logged" : dose.status;
			return `${here}${home}  ${dose.name} — ${dose.amount} — ${CONTEXTS[dose.context].label} — ${ANCHORS[dose.anchor].label} — ${mark}`;
		}),
		"",
		"Personal note only. Not a prescription, not a medical record.",
		"Paste into a translator if someone else keeps an eye on the day."
	].join("\n");
}
function missed(ago, dose) {
	if (ago === 4 && dose.id === "magnesium") return true;
	if (ago === 6 && dose.id === "omega") return true;
	if (ago === 9 && (dose.id === "morning-tablet" || dose.id === "omega")) return true;
	if (ago === 11 && dose.anchor === "body") return true;
	if (ago === 2 && dose.id === "probiotic") return true;
	return false;
}
function makeSeed(now = /* @__PURE__ */ new Date()) {
	const logs = [];
	for (let ago = 13; ago >= 1; ago -= 1) {
		const key = dateKey(addDays(now, -ago));
		for (const dose of ATLAS) if (!missed(ago, dose)) logs.push({
			date: key,
			doseId: dose.id
		});
	}
	const today = dateKey(now);
	const nowMin = minutesNow(now);
	for (const dose of ATLAS) if (nowMin > dose.minutes + 90) logs.push({
		date: today,
		doseId: dose.id
	});
	return {
		name: "Bruce",
		place: "Karachi",
		passageHours: 0,
		doses: ATLAS.map((dose) => ({ ...dose })),
		logs,
		notesSeen: false
	};
}
function isDose(value) {
	if (!value || typeof value !== "object") return false;
	const dose = value;
	return typeof dose.id === "string" && typeof dose.name === "string" && typeof dose.amount === "string" && typeof dose.minutes === "number" && (dose.context === "empty" || dose.context === "food" || dose.context === "water" || dose.context === "sleep") && (dose.anchor === "place" || dose.anchor === "body");
}
function loadState(now = /* @__PURE__ */ new Date()) {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return makeSeed(now);
		const parsed = JSON.parse(raw);
		if (!parsed || !Array.isArray(parsed.doses) || !Array.isArray(parsed.logs)) return makeSeed(now);
		const doses = parsed.doses.filter(isDose);
		return {
			name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name : "Bruce",
			place: typeof parsed.place === "string" ? parsed.place : "Karachi",
			passageHours: typeof parsed.passageHours === "number" ? Math.max(-12, Math.min(14, Math.round(parsed.passageHours))) : 0,
			doses,
			logs: parsed.logs.filter((entry) => !!entry && typeof entry === "object" && typeof entry.date === "string" && typeof entry.doseId === "string"),
			notesSeen: Boolean(parsed.notesSeen)
		};
	} catch {
		return makeSeed(now);
	}
}
function saveState(state) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function parseTimeInput(value) {
	const [h, m] = value.split(":");
	const hour = Number(h);
	const mins = Number(m);
	if (!Number.isFinite(hour) || !Number.isFinite(mins)) return 480;
	return wrapMinutes(hour * 60 + mins);
}
function toTimeInput(minutes) {
	return formatClock(minutes);
}
function point(minutes, radius) {
	const angle = minutes / 1440 * Math.PI * 2 - Math.PI / 2;
	return {
		x: 50 + Math.cos(angle) * radius,
		y: 50 + Math.sin(angle) * radius
	};
}
function beadRadii(doses) {
	const order = doses.map((dose, index) => ({
		index,
		shown: dose.shown
	})).sort((a, b) => a.shown - b.shown);
	const radii = new Array(doses.length).fill(33);
	for (let k = 0; k < order.length; k += 1) {
		const previous = order[k - 1];
		const near = previous ? order[k].shown - previous.shown <= 20 : false;
		const previousRadius = near && previous ? radii[previous.index] : 0;
		radii[order[k].index] = near && previousRadius === 33 ? 24 : 33;
	}
	return radii;
}
function shortTime(minutes) {
	const hour = Math.floor(minutes / 60);
	return `${hour % 12 || 12}${hour >= 12 ? "p" : "a"}`;
}
var beadClass = {
	taken: "border-ink bg-ink text-paper",
	open: "cadence-pulse border-brass bg-card text-brass border-2",
	soon: "border-ink bg-card text-ink",
	later: "border-line bg-card text-ink",
	slipped: "border-muted bg-paper text-muted border-dashed"
};
function OrbitRing({ doses, nowMinutes, onToggle }) {
	const radii = beadRadii(doses);
	const needle = point(nowMinutes, 29);
	const needleInner = point(nowMinutes, 15);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "ring-stage relative mx-auto aspect-square w-full max-w-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 100 100",
				className: "absolute inset-0 h-full w-full",
				role: "img",
				"aria-label": "Twenty-four hour ring. Midnight is at the top, noon at the bottom.",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "50",
						cy: "50",
						r: "47",
						fill: "none",
						stroke: "var(--color-line)",
						strokeWidth: "0.4"
					}),
					Array.from({ length: 24 }, (_, hour) => {
						const outer = point(hour * 60, 47);
						const inner = point(hour * 60, hour % 6 === 0 ? 44.2 : 45.6);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: inner.x,
							y1: inner.y,
							x2: outer.x,
							y2: outer.y,
							stroke: "var(--color-muted)",
							strokeWidth: hour % 6 === 0 ? .7 : .35
						}, hour);
					}),
					[
						0,
						6,
						12,
						18
					].map((hour) => {
						const spot = point(hour * 60, 40.5);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: spot.x,
							y: spot.y,
							textAnchor: "middle",
							dominantBaseline: "middle",
							fill: "var(--color-muted)",
							fontSize: "3.4",
							fontFamily: "var(--font-sans)",
							children: String(hour).padStart(2, "0")
						}, hour);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "50",
						cy: "50",
						r: "16.5",
						fill: "var(--color-card)",
						stroke: "var(--color-line)",
						strokeWidth: "0.45"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: needleInner.x,
						y1: needleInner.y,
						x2: needle.x,
						y2: needle.y,
						stroke: "var(--color-brass)",
						strokeWidth: "0.9",
						strokeLinecap: "round"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: needle.x,
						cy: needle.y,
						r: "1.15",
						fill: "var(--color-brass)"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 z-10 grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-24 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-widest text-muted",
						children: "NOW"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl leading-none tabular-nums",
						children: formatMinutes(nowMinutes)
					})]
				})
			}),
			doses.map((dose, index) => {
				const spot = point(dose.shown, radii[index] ?? 33);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `ring-bead tap absolute top-0 left-0 z-20 grid size-11 place-items-center rounded-full border text-xs font-semibold ${beadClass[dose.status]}`,
					style: { transform: `translate(calc(${spot.x} * 1cqw - 50%), calc(${spot.y} * 1cqh - 50%))` },
					"aria-pressed": dose.taken,
					"aria-label": `${dose.taken ? "Undo" : "Log"} ${dose.name} at ${formatMinutes(dose.shown)}`,
					onClick: () => onToggle(dose.id),
					children: dose.taken ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						className: "size-4",
						"aria-hidden": "true"
					}) : shortTime(dose.shown)
				}, dose.id);
			})
		]
	});
}
var VIEWS = [
	{
		id: "orbit",
		label: "Orbit",
		icon: SunMedium
	},
	{
		id: "plan",
		label: "Plan",
		icon: ListChecks
	},
	{
		id: "sky",
		label: "Sky",
		icon: Star
	},
	{
		id: "passage",
		label: "Passage",
		icon: Plane
	}
];
function CadenceApp() {
	const [state, setState] = (0, import_react.useState)(null);
	const [instant, setInstant] = (0, import_react.useState)(null);
	const [view, setView] = (0, import_react.useState)("orbit");
	const [panel, setPanel] = (0, import_react.useState)(null);
	const [copied, setCopied] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const started = /* @__PURE__ */ new Date();
		setInstant(started);
		setState(loadState(started));
		const timer = window.setInterval(() => setInstant(/* @__PURE__ */ new Date()), 1e3);
		return () => window.clearInterval(timer);
	}, []);
	(0, import_react.useEffect)(() => {
		if (state) saveState(state);
	}, [state]);
	if (!state || !instant) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-svh place-items-center bg-paper px-6 text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-muted",
				children: "CADENCE"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl",
				children: "Setting the ring"
			})]
		})
	});
	const clock = instant;
	const doses = placeDoses(state, clock);
	const clockMin = minutesNow(clock);
	const hero = heroCopy(doses, clockMin);
	const notes = whispers(doses);
	const slip = careSlip(state, doses, clock);
	const logged = doses.filter((dose) => dose.taken).length;
	function patch(partial) {
		setState((current) => current ? {
			...current,
			...partial
		} : current);
	}
	function toggleDose(id) {
		setState((current) => {
			if (!current) return current;
			const date = dateKey(clock);
			const logs = current.logs.some((entry) => entry.date === date && entry.doseId === id) ? current.logs.filter((entry) => !(entry.date === date && entry.doseId === id)) : [...current.logs, {
				date,
				doseId: id
			}];
			return {
				...current,
				logs
			};
		});
	}
	function logDue(ids) {
		setState((current) => {
			if (!current) return current;
			const date = dateKey(clock);
			const have = new Set(current.logs.filter((entry) => entry.date === date).map((entry) => entry.doseId));
			const extra = ids.filter((id) => !have.has(id)).map((doseId) => ({
				date,
				doseId
			}));
			return {
				...current,
				logs: [...current.logs, ...extra]
			};
		});
	}
	function removeDose(id) {
		setState((current) => {
			if (!current) return current;
			return {
				...current,
				doses: current.doses.filter((dose) => dose.id !== id),
				logs: current.logs.filter((entry) => entry.doseId !== id)
			};
		});
	}
	function addDose(draft) {
		setState((current) => {
			if (!current) return current;
			return {
				...current,
				doses: [...current.doses, {
					id: crypto.randomUUID(),
					name: draft.name.trim(),
					amount: draft.amount.trim(),
					minutes: draft.minutes,
					context: draft.context,
					anchor: draft.anchor
				}]
			};
		});
		setView("orbit");
	}
	function restore() {
		const fresh = makeSeed(/* @__PURE__ */ new Date());
		fresh.notesSeen = true;
		setState(fresh);
		setView("orbit");
		setPanel(null);
	}
	function land(place, hours, next) {
		patch({
			place,
			passageHours: hours
		});
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
	const shiftLabel = state.passageHours === 0 ? "Home clock" : `${state.passageHours > 0 ? "+" : ""}${state.passageHours}h from home`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-svh bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex w-full max-w-6xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-line px-6 py-8 md:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { onNotes: () => setPanel("notes") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {
							view,
							onChange: setView
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-auto",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-xs font-medium text-muted",
									htmlFor: "keeper-name",
									children: "The ring is for"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "keeper-name",
									value: state.name,
									onChange: (event) => patch({ name: event.target.value.slice(0, 32) }),
									className: "mt-2 h-11 w-full rounded-xl border border-line bg-card px-3 text-base outline-none"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-6 font-display text-lg leading-snug",
									children: "For the ring, not the alarm."
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "min-w-0 flex-1 px-5 pt-6 pb-28 md:px-10 md:pt-8 md:pb-12",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto flex max-w-3xl flex-col gap-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
								className: "flex items-start justify-between gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "md:hidden",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-widest text-muted",
											children: "CADENCE"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted",
											children: "Circadian care composer"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "hidden text-sm text-muted md:block",
										children: [
											state.name,
											" · ",
											state.place || "Unnamed city",
											" · ",
											shiftLabel
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "tap inline-flex h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-medium md:hidden",
											onClick: () => setPanel("notes"),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, {
												className: "size-4",
												"aria-hidden": "true"
											}), "Notes"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "tap inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-paper",
											onClick: () => {
												setCopied(false);
												setPanel("slip");
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
												className: "size-4",
												"aria-hidden": "true"
											}), "Care slip"]
										})]
									})
								]
							}),
							!state.notesSeen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-3 rounded-3xl border border-line bg-card p-4 sm:flex-row sm:items-center sm:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm leading-relaxed",
									children: "This is not a checklist. Cadence draws the day as a ring, then asks which doses follow meals and which follow your body across cities."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex shrink-0 gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "tap h-11 rounded-full bg-ink px-4 text-sm font-medium text-paper",
										onClick: () => {
											patch({ notesSeen: true });
											setPanel("notes");
										},
										children: "Field notes"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "tap h-11 rounded-full border border-line px-4 text-sm font-medium",
										onClick: () => patch({ notesSeen: true }),
										children: "Dismiss"
									})]
								})]
							}) : null,
							view === "orbit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitView, {
								hero,
								doses,
								nowMinutes: minutesNowFine(clock),
								logged,
								notes,
								passageHours: state.passageHours,
								onToggle: toggleDose,
								onLisbon: () => land("Lisbon", -4, "orbit")
							}) : null,
							view === "plan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanView, {
								doses,
								clockMin,
								onToggle: toggleDose,
								onLogDue: logDue,
								onRemove: removeDose,
								onAdd: addDose
							}) : null,
							view === "sky" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkyView, {
								state,
								clock
							}) : null,
							view === "passage" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PassageView, {
								state,
								doses,
								onLand: (place, hours) => land(place, hours),
								onHours: (passageHours) => patch({ passageHours }),
								onPlace: (place) => patch({ place }),
								onEase: () => {
									if (state.passageHours === 0) return;
									const step = state.passageHours > 0 ? -1 : 1;
									patch({ passageHours: state.passageHours + step });
								},
								onRestore: restore
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed text-muted",
								children: "Cadence only organizes what you type. It does not know interactions, doses, or you. A pharmacist does."
							})
						]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 backdrop-blur md:hidden",
				"aria-label": "Sections",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mx-auto grid max-w-lg grid-cols-4",
					children: VIEWS.map((item) => {
						const Icon = item.icon;
						const active = view === item.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: `tap flex h-16 w-full flex-col items-center justify-center gap-1 text-xs font-medium ${active ? "text-brass" : "text-muted"}`,
							"aria-current": active ? "page" : void 0,
							onClick: () => setView(item.id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5",
								"aria-hidden": "true"
							}), item.label]
						}) }, item.id);
					})
				})
			}),
			panel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 sm:items-center",
				onClick: () => setPanel(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "panel-title",
					className: "max-h-full w-full max-w-lg overflow-y-auto rounded-3xl bg-card p-6 text-ink",
					onClick: (event) => event.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "panel-title",
								className: "font-display text-3xl",
								children: panel === "notes" ? "Field notes" : "Care slip"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "tap grid size-11 place-items-center rounded-full border border-line",
								"aria-label": "Close",
								onClick: () => setPanel(null),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
							})]
						}),
						panel === "notes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldNotes, { onRestore: restore }) : null,
						panel === "slip" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-col gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm leading-relaxed text-muted",
									children: "A plain note for another person, or for a translator. Nothing is uploaded."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									readOnly: true,
									value: slip,
									className: "min-h-64 w-full rounded-2xl border border-line bg-paper p-4 text-sm leading-relaxed"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "tap h-12 rounded-full bg-ink text-sm font-medium text-paper",
									onClick: () => void copySlip(),
									children: copied ? "Copied" : "Copy the slip"
								})
							]
						}) : null
					]
				})
			}) : null
		]
	});
}
function Brand({ onNotes }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-widest text-brass",
			children: "CADENCE"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-3 font-display text-4xl leading-none",
			children: "The day, composed."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "tap mt-5 inline-flex h-11 items-center gap-2 text-sm font-medium text-ink",
			onClick: onNotes,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, {
				className: "size-4 text-brass",
				"aria-hidden": "true"
			}), "Field notes"]
		})
	] });
}
function Nav({ view, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "mt-10",
		"aria-label": "Sections",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-1",
			children: VIEWS.map((item) => {
				const Icon = item.icon;
				const active = view === item.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `tap flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium ${active ? "bg-card text-ink" : "text-muted"}`,
					"aria-current": active ? "page" : void 0,
					onClick: () => onChange(item.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: `size-4 ${active ? "text-brass" : ""}`,
						"aria-hidden": "true"
					}), item.label]
				}) }, item.id);
			})
		})
	});
}
function OrbitView({ hero, doses, nowMinutes, logged, notes, passageHours, onToggle, onLisbon }) {
	const ahead = doses.filter((dose) => dose.status === "soon" || dose.status === "later").length;
	const slipped = doses.filter((dose) => dose.status === "slipped").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-6",
		"aria-labelledby": "orbit-title",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "orbit-title",
				className: "font-display text-4xl md:text-5xl",
				children: hero.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-base leading-relaxed text-muted",
				children: hero.body
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitRing, {
				doses,
				nowMinutes,
				onToggle
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2.5 rounded-full bg-ink",
							"aria-hidden": "true"
						}), " Logged"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2.5 rounded-full border-2 border-brass",
							"aria-hidden": "true"
						}), " In window"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-2.5 rounded-full border border-line bg-card",
								"aria-hidden": "true"
							}),
							" ",
							"Ahead"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-2.5 rounded-full border border-dashed border-muted",
								"aria-hidden": "true"
							}),
							" ",
							"Slipped"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-3 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Logged",
						value: String(logged),
						hint: `of ${doses.length}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Ahead",
						value: String(ahead),
						hint: "not yet due"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Slipped",
						value: String(slipped),
						hint: "unmarked, window shut"
					})
				]
			}),
			notes.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-3xl border border-line bg-card px-4 py-3 text-sm leading-relaxed",
				children: note
			}, note)),
			passageHours === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "tap self-start text-sm font-medium text-brass",
				onClick: onLisbon,
				children: "Preview a landing in Lisbon. Body-clock doses slide four hours earlier."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm leading-relaxed text-muted",
				children: [
					"Beads with a local-clock anchor stayed put. Body-clock beads moved ",
					Math.abs(passageHours),
					" ",
					Math.abs(passageHours) === 1 ? "hour" : "hours",
					" ",
					passageHours < 0 ? "earlier" : "later",
					"."
				]
			})
		]
	});
}
function Stat({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl border border-line bg-card px-4 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "text-xs font-medium text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: "mt-2 font-display text-3xl tabular-nums",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: hint
			})
		]
	});
}
function PlanView({ doses, clockMin, onToggle, onLogDue, onRemove, onAdd }) {
	const ordered = [...doses].sort((a, b) => a.shown - b.shown);
	const groups = [];
	for (const dose of ordered) {
		const last = groups[groups.length - 1];
		if (!last || last.ritual !== dose.ritual) groups.push({
			ritual: dose.ritual,
			items: [dose]
		});
		else last.items.push(dose);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-8",
		"aria-labelledby": "plan-title",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-muted",
				children: "PLAN"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "plan-title",
				className: "mt-2 font-display text-4xl",
				children: "Rituals, in the order the day meets them."
			})] }),
			groups.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-3xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted",
				children: "Nothing on the ring yet. The form below is the whole plan."
			}) : groups.map((group) => {
				const due = group.items.filter((dose) => !dose.taken && (dose.status === "open" || dose.status === "slipped"));
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-2xl",
							children: RITUALS[group.ritual].label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: RITUALS[group.ritual].line
						})] }), due.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "tap h-11 shrink-0 rounded-full border border-line bg-card px-4 text-sm font-medium",
							onClick: () => onLogDue(due.map((dose) => dose.id)),
							children: [
								"Log ",
								due.length,
								" due"
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted",
							children: "Nothing due unmarked"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-col gap-3",
						children: group.items.map((dose) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoseRow, {
							dose,
							clockMin,
							onToggle,
							onRemove
						}, dose.id))
					})]
				}, group.ritual);
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Composer, { onAdd })
		]
	});
}
function DoseRow({ dose, clockMin, onToggle, onRemove }) {
	const [confirm, setConfirm] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
		className: "rounded-3xl border border-line bg-card p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl tabular-nums",
						children: formatMinutes(dose.shown)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-1 text-base font-medium",
						children: dose.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							dose.amount,
							" · ",
							CONTEXTS[dose.context].label,
							" · ",
							ANCHORS[dose.anchor].label
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm",
						children: windowCopy(dose.status, dose.shown, clockMin)
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `tap h-11 rounded-full px-4 text-sm font-medium ${dose.taken ? "bg-paper text-ink" : "bg-ink text-paper"}`,
					onClick: () => onToggle(dose.id),
					children: dose.taken ? "Undo" : "Log"
				}), confirm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "tap h-11 rounded-full border border-line px-4 text-sm font-medium",
					onClick: () => onRemove(dose.id),
					children: "Remove"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "tap grid size-11 place-items-center rounded-full border border-line",
					"aria-label": `Remove ${dose.name}`,
					onClick: () => setConfirm(true),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			})]
		})
	});
}
function Composer({ onAdd }) {
	const [name, setName] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [time, setTime] = (0, import_react.useState)("09:00");
	const [context, setContext] = (0, import_react.useState)("food");
	const [anchor, setAnchor] = (0, import_react.useState)("place");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex flex-col gap-4 rounded-3xl border border-line bg-card p-5",
		onSubmit: (event) => {
			event.preventDefault();
			if (!name.trim() || !amount.trim()) return;
			onAdd({
				name,
				amount,
				minutes: parseTimeInput(time),
				context,
				anchor
			});
			setName("");
			setAmount("");
			setTime("09:00");
			setContext("food");
			setAnchor("place");
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
					className: "size-4 text-brass",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-2xl",
					children: "Add to the ring"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-2 text-sm font-medium",
				htmlFor: "dose-name",
				children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "dose-name",
					required: true,
					value: name,
					maxLength: 40,
					placeholder: "Vitamin D",
					onChange: (event) => setName(event.target.value),
					className: "h-12 rounded-xl border border-line bg-paper px-3 text-base font-normal outline-none"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-2 text-sm font-medium",
				htmlFor: "dose-amount",
				children: ["Amount, in your words", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "dose-amount",
					required: true,
					value: amount,
					maxLength: 48,
					placeholder: "1 softgel",
					onChange: (event) => setAmount(event.target.value),
					className: "h-12 rounded-xl border border-line bg-paper px-3 text-base font-normal outline-none"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-2 text-sm font-medium",
				htmlFor: "dose-time",
				children: ["Home time", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "dose-time",
					type: "time",
					required: true,
					value: time,
					onChange: (event) => setTime(event.target.value),
					className: "h-12 rounded-xl border border-line bg-paper px-3 text-base font-normal outline-none"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
				className: "text-sm font-medium",
				children: "How you take it"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 grid grid-cols-2 gap-2",
				children: Object.keys(CONTEXTS).map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": context === key,
					className: `tap h-11 rounded-xl border px-3 text-sm ${context === key ? "border-ink bg-ink text-paper" : "border-line bg-paper"}`,
					onClick: () => setContext(key),
					children: CONTEXTS[key].label
				}, key))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
				className: "text-sm font-medium",
				children: "What it follows"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 grid gap-2",
				children: Object.keys(ANCHORS).map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-pressed": anchor === key,
					className: `tap rounded-xl border px-3 py-3 text-left ${anchor === key ? "border-ink bg-ink text-paper" : "border-line bg-paper"}`,
					onClick: () => setAnchor(key),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm font-medium",
						children: ANCHORS[key].label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `mt-1 block text-xs ${anchor === key ? "text-paper" : "text-muted"}`,
						children: ANCHORS[key].hint
					})]
				}, key))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				className: "tap h-12 rounded-full bg-ink text-sm font-medium text-paper",
				children: "Place it on the ring"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs leading-relaxed text-muted",
				children: [
					"Home time is ",
					toTimeInput(parseTimeInput(time)),
					" on your usual clock. Passage can slide it later if you mark it body-clock."
				]
			})
		]
	});
}
function SkyView({ state, clock }) {
	const marks = fortnight(state, clock);
	const rows = weekRows(marks);
	const [Chart, setChart] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let live = true;
		import("./sky-chart-CImefWqX.mjs").then((mod) => {
			if (live) setChart(() => mod.SkyChart);
		});
		return () => {
			live = false;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-6",
		"aria-labelledby": "sky-title",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-widest text-muted",
					children: "SKY"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "sky-title",
					className: "mt-2 font-display text-4xl",
					children: "Fourteen days, without a streak costume."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-xl text-base leading-relaxed text-muted",
					children: skySentence(marks)
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "grid grid-cols-7 gap-2",
				"aria-label": "Fourteen days of logged doses",
				children: marks.map((mark) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayDot, { mark }, mark.key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "Deeper brass means more of that day was logged."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-3xl border border-line bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-2xl",
					children: "This week"
				}), state.doses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "Add a dose and the week will have something to measure."
				}) : Chart ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chart, { rows }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-52" })]
			})
		]
	});
}
function DayDot({ mark }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex flex-col items-center gap-1 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "sr-only",
				children: [
					mark.isToday ? "Today" : mark.weekday,
					" ",
					mark.label,
					": ",
					mark.taken,
					" of ",
					mark.total,
					" logged"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `grid size-9 place-items-center rounded-full border ${mark.isToday ? "border-ink" : "border-line"} bg-card`,
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "size-5 rounded-full bg-brass",
					style: { opacity: mark.pct / 100 }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted",
				"aria-hidden": "true",
				children: mark.isToday ? "Now" : mark.label
			})
		]
	});
}
function PassageView({ state, doses, onLand, onHours, onPlace, onEase, onRestore }) {
	const ordered = [...doses].sort((a, b) => a.shown - b.shown);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-6",
		"aria-labelledby": "passage-title",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-widest text-muted",
					children: "PASSAGE"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "passage-title",
					className: "mt-2 font-display text-4xl",
					children: "Two clocks, one landing."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-xl text-base leading-relaxed text-muted",
					children: "Your phone already shows local time. Passage does not change that clock. It moves only the doses you marked as body-clock, by the hours between home and here. Meal doses stay on the numbers printed beside breakfast."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-3 sm:grid-cols-2",
				children: LANDINGS.map((landing) => {
					const active = state.place === landing.place && state.passageHours === landing.hours;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": active,
						className: `tap h-full w-full rounded-3xl border p-4 text-left ${active ? "border-ink bg-ink text-paper" : "border-line bg-card"}`,
						onClick: () => onLand(landing.place, landing.hours),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-baseline justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-2xl",
								children: landing.place
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm tabular-nums",
								children: [landing.hours > 0 ? `+${landing.hours}` : landing.hours, "h"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `mt-2 block text-sm leading-relaxed ${active ? "text-paper" : "text-muted"}`,
							children: landing.blurb
						})]
					}) }, landing.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-3xl border border-line bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-1 flex-col gap-2 text-sm font-medium",
						htmlFor: "place-name",
						children: ["City on the slip", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "place-name",
							value: state.place,
							maxLength: 32,
							onChange: (event) => onPlace(event.target.value),
							className: "h-12 rounded-xl border border-line bg-paper px-3 text-base font-normal outline-none"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "tap grid size-12 place-items-center rounded-full border border-line text-lg",
								"aria-label": "One hour earlier",
								onClick: () => onHours(Math.max(-12, state.passageHours - 1)),
								children: "−"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "min-w-16 text-center font-display text-3xl tabular-nums",
								children: state.passageHours > 0 ? `+${state.passageHours}` : state.passageHours
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "tap grid size-12 place-items-center rounded-full border border-line text-lg",
								"aria-label": "One hour later",
								onClick: () => onHours(Math.min(14, state.passageHours + 1)),
								children: "+"
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "tap mt-4 h-11 rounded-full border border-line px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40",
					disabled: state.passageHours === 0,
					onClick: onEase,
					children: "Ease one hour toward home"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: ordered.map((dose) => {
					const moved = dose.anchor === "body" && state.passageHours !== 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "grid gap-1 rounded-2xl border border-line bg-card px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: dose.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: ANCHORS[dose.anchor].label
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm tabular-nums sm:text-right",
							children: moved ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								"Home ",
								formatMinutes(dose.minutes),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "px-2 text-muted",
									"aria-hidden": "true",
									children: "→"
								}),
								"Here ",
								formatMinutes(dose.shown)
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Stays ", formatMinutes(dose.shown)] })
						})]
					}, dose.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "self-start text-sm font-medium text-muted",
				onClick: onRestore,
				children: "Restore the sample week"
			})
		]
	});
}
function FieldNotes({ onRestore }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 flex flex-col gap-4 text-sm leading-relaxed",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "MediGo was a list: a name, a dose, a time, and a taken flag that never rolled into tomorrow. Cadence keeps that list and gives the day a shape." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, {
				title: "The orbit",
				body: "Midnight is at the top. Each dose is a bead. The brass hand is this device’s clock. A window opens 45 minutes before the dose and stays open 90 minutes after. Tap a bead to log it, tap again to undo. Logging is for this calendar date only."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, {
				title: "Two anchors",
				body: "Local-clock doses stay at the same numbers in every city — vitamin with breakfast is still 8:15 beside whatever breakfast is now. Body-clock doses slide by the passage hours — a wind-down capsule follows the old evening until you ease it home."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, {
				title: "Passage",
				body: "The offsets are real October gaps from Karachi: Lisbon −4, Tokyo +4, New York −9. Passage never rewrites your phone’s time. It only redraws body-clock beads against the time this device already shows. Ease one hour toward home when the jet lag actually eases. Don’t pretend a slider is a medical plan."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, {
				title: "The one whisper",
				body: "If an empty-stomach dose and a with-food dose land within two hours, Cadence says so. That is the only rule. It does not know drug interactions, and it will not reschedule you."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, {
				title: "Sky and the slip",
				body: "Sky is fourteen real days of what you logged, including a sample fortnight so the demo is not an empty grid. The care slip is plain text on this device. Paste it into a translator for family. Nothing leaves the browser."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-start gap-2 text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
					className: "mt-0.5 size-4 shrink-0 text-brass",
					"aria-hidden": "true"
				}), "Sample doses are labels, not advice. Replace them with your own words."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "self-start font-medium text-brass",
				onClick: onRestore,
				children: "Restore the sample week"
			})
		]
	});
}
function Note({ title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: "font-display text-xl",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1 text-muted",
		children: body
	})] });
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CadenceApp, {});
}
//#endregion
export { Home as component };
