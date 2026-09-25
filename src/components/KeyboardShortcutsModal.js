import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
/**
 * KeyboardShortcutsModal
 *
 * Shows full list of keyboard shortcuts supported in the app.
 * Can be opened by pressing '?' or clicking the keyboard icon.
 */
export function KeyboardShortcutsModal({ isOpen, onClose, }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "modal-backdrop", onClick: onClose, role: "dialog", "aria-modal": "true", "aria-labelledby": "shortcuts-modal-title", children: _jsxs("div", { className: "modal-content", onClick: (e) => e.stopPropagation(), tabIndex: -1, children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { id: "shortcuts-modal-title", className: "modal-title", children: "\u2328\uFE0F Keyboard Shortcuts" }), _jsx("button", { type: "button", className: "modal-close-btn", onClick: onClose, "aria-label": "Close keyboard shortcuts dialog", children: "\u2715" })] }), _jsxs("div", { className: "shortcuts-table", children: [_jsxs("div", { className: "shortcut-section", children: [_jsx("h4", { className: "shortcut-section-title", children: "General" }), _jsxs("div", { className: "shortcut-row", children: [_jsx("span", { className: "shortcut-desc", children: "Generate Study Set" }), _jsx("kbd", { className: "shortcut-kbd", children: "Ctrl + Enter" })] }), _jsxs("div", { className: "shortcut-row", children: [_jsx("span", { className: "shortcut-desc", children: "Open Shortcut Guide" }), _jsx("kbd", { className: "shortcut-kbd", children: "?" })] }), _jsxs("div", { className: "shortcut-row", children: [_jsx("span", { className: "shortcut-desc", children: "Close Modal" }), _jsx("kbd", { className: "shortcut-kbd", children: "Esc" })] })] }), _jsxs("div", { className: "shortcut-section", children: [_jsx("h4", { className: "shortcut-section-title", children: "Flashcards Mode" }), _jsxs("div", { className: "shortcut-row", children: [_jsx("span", { className: "shortcut-desc", children: "Flip Card" }), _jsx("kbd", { className: "shortcut-kbd", children: "Space / Enter" })] }), _jsxs("div", { className: "shortcut-row", children: [_jsx("span", { className: "shortcut-desc", children: "Previous Card" }), _jsx("kbd", { className: "shortcut-kbd", children: "\u2190 (Left Arrow)" })] }), _jsxs("div", { className: "shortcut-row", children: [_jsx("span", { className: "shortcut-desc", children: "Next Card" }), _jsx("kbd", { className: "shortcut-kbd", children: "\u2192 (Right Arrow)" })] }), _jsxs("div", { className: "shortcut-row", children: [_jsx("span", { className: "shortcut-desc", children: "Mark \"Got it\" (Known)" }), _jsx("kbd", { className: "shortcut-kbd", children: "1" })] }), _jsxs("div", { className: "shortcut-row", children: [_jsx("span", { className: "shortcut-desc", children: "Mark \"Missed\"" }), _jsx("kbd", { className: "shortcut-kbd", children: "2" })] })] }), _jsxs("div", { className: "shortcut-section", children: [_jsx("h4", { className: "shortcut-section-title", children: "Quiz Mode" }), _jsxs("div", { className: "shortcut-row", children: [_jsx("span", { className: "shortcut-desc", children: "Select Options A, B, C, D" }), _jsx("kbd", { className: "shortcut-kbd", children: "1, 2, 3, 4" })] }), _jsxs("div", { className: "shortcut-row", children: [_jsx("span", { className: "shortcut-desc", children: "Next Question / View Results" }), _jsx("kbd", { className: "shortcut-kbd", children: "Enter / Space" })] })] })] }), _jsx("div", { className: "modal-footer", children: _jsx("button", { type: "button", className: "primary-btn", onClick: onClose, children: "Got it" }) })] }) }));
}
export default KeyboardShortcutsModal;
