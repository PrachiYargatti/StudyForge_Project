import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ErrorState
 *
 * Rendered when status === 'error'.
 * Features:
 * - Friendly, category-specific error messages mapped from normalized error codes
 * - Retry button to immediately re-send the exact same request
 * - Edit Input button to guide focus back to the textarea without losing work
 * - Screen reader announcements via role="alert" and aria-live="assertive"
 */
export function ErrorState({ error, onRetry, onEditInput }) {
    const getErrorMeta = (code) => {
        switch (code) {
            case 'MISSING_KEY':
                return {
                    title: 'Server Configuration Required',
                    description: 'The GEMINI_API_KEY is missing or unconfigured on the server. Please set your key in .env and restart.',
                    hint: 'Get a free key from Google AI Studio (https://aistudio.google.com).',
                };
            case 'RATE_LIMITED':
                return {
                    title: 'Rate Limit Reached',
                    description: 'Too many requests were sent to the AI service in a short period. Please wait a few seconds before retrying.',
                    hint: 'Free-tier quotas typically reset within 60 seconds.',
                };
            case 'TIMEOUT':
                return {
                    title: 'Request Timed Out',
                    description: 'The AI took longer than 30 seconds to generate a response. The upstream service may be experiencing high load.',
                    hint: 'Try reducing the number of requested items or shortening the input text.',
                };
            case 'PARSE_ERROR':
                return {
                    title: 'Unreadable AI Response',
                    description: 'The AI returned something that could not be parsed as valid JSON.',
                    hint: 'Clicking Try Again usually yields a properly formatted result.',
                };
            case 'VALIDATION_ERROR':
                return {
                    title: 'Unexpected Output Format',
                    description: error.message || "The AI's response was missing required fields or questions.",
                    hint: 'Our schema validator caught this to protect your study session.',
                };
            case 'EMPTY_RESPONSE':
                return {
                    title: 'Empty Response Received',
                    description: 'The AI returned an empty response. This occasionally happens with overly short topics.',
                    hint: 'Try adding a brief sentence or details to your study notes.',
                };
            case 'NETWORK_ERROR':
                return {
                    title: 'Connection Failed',
                    description: 'Could not reach the StudyForge server. Please make sure the backend process is running.',
                    hint: 'Run "npm start" to launch both frontend and backend concurrently.',
                };
            case 'BAD_REQUEST':
                return {
                    title: 'Invalid Request',
                    description: error.message || 'Please check your input notes or selected mode.',
                    hint: 'Ensure your input is between 1 and 8,000 characters.',
                };
            case 'UPSTREAM_ERROR':
            default:
                return {
                    title: 'AI Service Error',
                    description: error.message || 'An error occurred while contacting the AI service.',
                    hint: 'Please try again in a few moments.',
                };
        }
    };
    const meta = getErrorMeta(error.code);
    return (_jsxs("div", { className: "state-card error-state", role: "alert", "aria-live": "assertive", children: [_jsx("div", { className: "error-icon-wrapper", "aria-hidden": "true", children: _jsxs("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }), _jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })] }) }), _jsxs("div", { className: "error-content", children: [_jsx("span", { className: "error-badge", children: error.code }), _jsx("h3", { className: "error-title", children: meta.title }), _jsx("p", { className: "error-description", children: meta.description }), meta.hint && _jsx("p", { className: "error-hint", children: meta.hint })] }), _jsxs("div", { className: "error-actions", children: [_jsxs("button", { type: "button", onClick: onRetry, className: "retry-btn primary-btn", "aria-label": "Try generating study set again", children: [_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("polyline", { points: "1 4 1 10 7 10" }), _jsx("path", { d: "M3.51 15a9 9 0 1 0 2.13-9.36L1 10" })] }), _jsx("span", { children: "Try Again" })] }), onEditInput && (_jsx("button", { type: "button", onClick: onEditInput, className: "secondary-btn", "aria-label": "Edit your input notes", children: _jsx("span", { children: "Edit Notes" }) }))] })] }));
}
export default ErrorState;
