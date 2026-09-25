import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const EXAMPLE_PROMPTS = [
    {
        label: 'Biology',
        topic: 'Photosynthesis & Cellular Respiration',
        mode: 'flashcards',
        text: 'Photosynthesis: Light-dependent reactions in the thylakoid membrane convert solar energy to ATP and NADPH while splitting water to produce oxygen. The Calvin cycle occurs in the stroma, using Rubisco to fix CO2 into G3P sugars. Cellular respiration in mitochondria converts glucose into ATP via glycolysis, Krebs cycle, and electron transport chain.',
    },
    {
        label: 'Computer Science',
        topic: 'OS Scheduling & Deadlocks',
        mode: 'quiz',
        text: 'Operating Systems CPU Scheduling: Preemptive vs non-preemptive algorithms. Shortest Job First (SJF) minimizes average waiting time but can cause starvation of long jobs. Round Robin provides fair time-slicing via time quantum. Deadlock requires four Coffman conditions: mutual exclusion, hold-and-wait, no preemption, and circular wait. Banker algorithm prevents deadlock.',
    },
    {
        label: 'Chemistry',
        topic: 'Acids, Bases & Buffers',
        mode: 'flashcards',
        text: 'Acids and Bases: Arrhenius definition (H+ or OH- donors in water), Bronsted-Lowry (proton donor/acceptor), and Lewis (electron pair acceptor/donor). pH is defined as -log[H+]. Strong acids (HCl, HNO3, H2SO4) dissociate completely. Buffer solutions resist pH changes when small amounts of acid or base are added, typically composed of a weak acid and its conjugate base.',
    },
    {
        label: 'Web Dev',
        topic: 'HTTP Caching & REST APIs',
        mode: 'quiz',
        text: 'Web Architecture: RESTful HTTP methods. GET, PUT, and DELETE are idempotent; POST is not idempotent. Cache-Control directives include max-age, no-cache, and stale-while-revalidate. ETags enable conditional validation via If-None-Match headers (returning 304 Not Modified). CORS prevents cross-origin requests unless the server explicitly allows them.',
    },
];
/**
 * EmptyState
 *
 * Rendered when no study deck is loaded yet (first visit / idle).
 * Offers clickable, rich educational examples to let the user immediately
 * test out generation without typing or searching for study material.
 */
export function EmptyState({ onSelectPrompt }) {
    return (_jsxs("div", { className: "state-card empty-state", children: [_jsxs("div", { className: "empty-hero", children: [_jsx("div", { className: "empty-icon-badge", "aria-hidden": "true", children: _jsxs("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" }), _jsx("path", { d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" })] }) }), _jsx("h3", { className: "empty-title", children: "Ready when you are" }), _jsx("p", { className: "empty-subtitle", children: "Turn any lecture notes, article excerpts, or topics into structured 3D flashcards and interactive quizzes in seconds." })] }), _jsxs("div", { className: "empty-examples-section", children: [_jsx("h4", { className: "examples-header", children: "Or try an example topic:" }), _jsx("div", { className: "examples-grid", children: EXAMPLE_PROMPTS.map((item, index) => (_jsxs("button", { type: "button", className: "example-prompt-card", onClick: () => onSelectPrompt(item.text, item.mode), "aria-label": `Load example prompt for ${item.topic} in ${item.mode} mode`, children: [_jsxs("div", { className: "example-meta", children: [_jsx("span", { className: "example-tag", children: item.label }), _jsx("span", { className: "example-mode-badge", children: item.mode })] }), _jsx("h5", { className: "example-topic", children: item.topic }), _jsxs("p", { className: "example-snippet", children: [item.text.slice(0, 110), "..."] }), _jsxs("span", { className: "example-cta", children: ["Click to load", _jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" }), _jsx("polyline", { points: "12 5 19 12 12 19" })] })] })] }, index))) })] })] }));
}
export default EmptyState;
