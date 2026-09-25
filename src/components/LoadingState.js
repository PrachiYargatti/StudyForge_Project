import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * LoadingState
 *
 * Rendered when status === 'loading'.
 * Features:
 * - Animated visual indicator (card pulse / shimmer)
 * - Dynamic status message based on mode
 * - Cancel button to immediately abort the request via AbortController
 * - aria-live polite announcement for screen readers
 */
export function LoadingState({ mode, onCancel }) {
    return (_jsxs("div", { className: "state-card loading-state", role: "status", "aria-live": "polite", children: [_jsx("div", { className: "loading-animation-container", children: _jsxs("div", { className: "loading-spinner-ring", "aria-hidden": "true", children: [_jsx("div", {}), _jsx("div", {}), _jsx("div", {})] }) }), _jsxs("h3", { className: "loading-title", children: ["Generating your ", mode === 'flashcards' ? 'flashcard deck' : 'interactive quiz', "..."] }), _jsx("p", { className: "loading-description", children: "Analyzing your study material, identifying core concepts, and structuring questions." }), _jsxs("div", { className: "skeleton-preview", "aria-hidden": "true", children: [_jsx("div", { className: "skeleton-line title" }), _jsxs("div", { className: "skeleton-card", children: [_jsx("div", { className: "skeleton-line text-long" }), _jsx("div", { className: "skeleton-line text-medium" }), _jsx("div", { className: "skeleton-line text-short" })] })] }), _jsx("div", { className: "loading-actions", children: _jsxs("button", { type: "button", onClick: onCancel, className: "cancel-btn secondary-btn", "aria-label": "Cancel study set generation", children: [_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("line", { x1: "15", y1: "9", x2: "9", y2: "15" }), _jsx("line", { x1: "9", y1: "9", x2: "15", y2: "15" })] }), _jsx("span", { children: "Cancel Generation" })] }) })] }));
}
export default LoadingState;
