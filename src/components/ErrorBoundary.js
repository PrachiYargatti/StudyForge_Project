import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
/**
 * ErrorBoundary
 *
 * Wraps ResultView to catch any unexpected runtime JavaScript errors during render,
 * preventing white screen crashes and offering a recovery action.
 */
export class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null,
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary caught error]:', error, errorInfo);
    }
    handleReset = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (_jsxs("div", { className: "state-card error-state error-boundary-fallback", role: "alert", children: [_jsx("div", { className: "error-icon-wrapper", "aria-hidden": "true", children: _jsxs("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("polygon", { points: "12 2 2 22 22 22 12 2" }), _jsx("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), _jsx("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })] }) }), _jsxs("div", { className: "error-content", children: [_jsx("h3", { className: "error-title", children: "Something went wrong displaying this study set" }), _jsx("p", { className: "error-description", children: "An unexpected render error occurred. Your study notes have been preserved." }), this.state.error?.message && (_jsxs("p", { className: "error-hint", children: ["Error: ", this.state.error.message] }))] }), _jsx("div", { className: "error-actions", children: _jsx("button", { type: "button", className: "primary-btn", onClick: this.handleReset, "aria-label": "Reload and try again", children: "Reload View" }) })] }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
