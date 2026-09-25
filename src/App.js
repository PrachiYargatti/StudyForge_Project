import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useRef } from 'react';
import { PromptInput } from './components/PromptInput';
import { ResultView } from './components/ResultView';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { EmptyState } from './components/EmptyState';
import { ErrorBoundary } from './components/ErrorBoundary';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { useGenerate } from './hooks/useGenerate';
import { validateResult } from './lib/validateResult';
const STORAGE_KEY = 'studyforge_saved_session';
const THEME_KEY = 'studyforge_theme';
export default function App() {
    // 1. Core Generator Hook
    const { status, data, error, droppedCount, generate, cancel, retry, reset, loadSaved, } = useGenerate();
    // 2. Input Form State (Preserved across errors)
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('flashcards');
    const [count, setCount] = useState(8);
    const [mockMode, setMockMode] = useState('none');
    // 3. UI State
    const [theme, setTheme] = useState('light');
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
    const [isInputExpanded, setIsInputExpanded] = useState(true);
    const [progressState, setProgressState] = useState(null);
    const initialLoadDone = useRef(false);
    // 4. Initialize Theme from system preference or localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
        else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);
    const toggleTheme = () => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem(THEME_KEY, nextTheme);
    };
    // 5. Stretch Goal 1: Load saved session from localStorage (re-validated)
    useEffect(() => {
        if (initialLoadDone.current)
            return;
        initialLoadDone.current = true;
        try {
            const savedRaw = localStorage.getItem(STORAGE_KEY);
            if (savedRaw) {
                const parsed = JSON.parse(savedRaw);
                if (parsed && parsed.deck && parsed.mode) {
                    // Untrusted stored data re-validation
                    const validation = validateResult(parsed.deck, parsed.mode);
                    if (validation.ok) {
                        loadSaved(validation.data);
                        setInput(parsed.input || '');
                        setMode(parsed.mode);
                        setCount(parsed.count || 8);
                        setProgressState(parsed.progressState || null);
                        setIsInputExpanded(false); // Collapse prompt input since deck is active
                    }
                }
            }
        }
        catch (err) {
            console.warn('Could not restore saved study session:', err);
        }
    }, [loadSaved]);
    // 6. Save current active session to localStorage
    useEffect(() => {
        if (status === 'success' && data) {
            try {
                const sessionToStore = {
                    deck: data,
                    mode: data.mode,
                    input,
                    count,
                    progressState,
                    timestamp: Date.now(),
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionToStore));
            }
            catch (err) {
                console.warn('Could not save session to localStorage:', err);
            }
        }
    }, [status, data, input, count, progressState]);
    // 7. Global Keyboard Shortcut for '?'
    useEffect(() => {
        const handleGlobalKey = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                return;
            }
            if (e.key === '?' || (e.shiftKey && e.key === '/')) {
                e.preventDefault();
                setIsShortcutsOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleGlobalKey);
        return () => window.removeEventListener('keydown', handleGlobalKey);
    }, []);
    // Form submission handler
    const handleGenerate = () => {
        generate({
            input,
            mode,
            count,
            mockMode,
        });
        setIsInputExpanded(false);
    };
    // Empty state example selection
    const handleSelectExample = (text, exampleMode) => {
        setInput(text);
        setMode(exampleMode);
        setIsInputExpanded(true);
        // Smooth scroll to top of prompt
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    // New topic action
    const handleNewTopic = useCallback(() => {
        reset();
        setProgressState(null);
        localStorage.removeItem(STORAGE_KEY);
        setIsInputExpanded(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [reset]);
    const handleEditNotes = () => {
        setIsInputExpanded(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    return (_jsxs("div", { className: "app-shell", children: [_jsx("header", { className: "app-header", children: _jsxs("div", { className: "header-inner", children: [_jsxs("div", { className: "brand", onClick: handleNewTopic, role: "button", tabIndex: 0, children: [_jsx("div", { className: "brand-logo", "aria-hidden": "true", children: _jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", children: [_jsx("path", { d: "M12 2L2 7l10 5 10-5-10-5z" }), _jsx("path", { d: "M2 17l10 5 10-5" }), _jsx("path", { d: "M2 12l10 5 10-5" })] }) }), _jsxs("div", { className: "brand-text", children: [_jsx("h1", { className: "brand-title", children: "StudyForge" }), _jsx("span", { className: "brand-badge", children: "Learn faster \u00B7 remember longer" })] })] }), _jsxs("div", { className: "header-actions", children: [_jsxs("div", { className: "mock-selector-wrapper", title: "Simulate AI Failures via MOCK_MODE", children: [_jsx("label", { htmlFor: "mock-mode-select", className: "mock-label", children: "Mock:" }), _jsxs("select", { id: "mock-mode-select", value: mockMode, onChange: (e) => setMockMode(e.target.value), className: `mock-select ${mockMode !== 'none' ? 'mock-active' : ''}`, "aria-label": "Select Mock Failure Mode for testing", children: [_jsx("option", { value: "none", children: "Off (Gemini API)" }), _jsx("option", { value: "malformed", children: "Malformed JSON" }), _jsx("option", { value: "fenced", children: "Fenced JSON (```json)" }), _jsx("option", { value: "wrong_shape", children: "Wrong Shape" }), _jsx("option", { value: "bad_correct_index", children: "Bad correctIndex" }), _jsxs("option", { value: "empty", children: ["Empty Response (", ")"] }), _jsx("option", { value: "partial", children: "Partially Valid (2/4)" }), _jsx("option", { value: "slow", children: "Slow / Timeout (35s)" }), _jsx("option", { value: "500", children: "500 Server Error" }), _jsx("option", { value: "429", children: "429 Rate Limit" })] })] }), _jsx("button", { type: "button", className: "icon-btn", onClick: () => setIsShortcutsOpen(true), title: "Keyboard shortcuts (?)", "aria-label": "View keyboard shortcuts", children: "\u2328\uFE0F" }), _jsx("button", { type: "button", className: "icon-btn theme-toggle-btn", onClick: toggleTheme, title: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`, "aria-label": `Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`, children: theme === 'light' ? '🌙' : '☀️' })] })] }) }), _jsx("main", { className: "main-content", children: _jsxs("div", { className: "content-container", children: [status === 'idle' && !data && (_jsxs("section", { className: "hero-strip", "aria-label": "StudyForge highlights", children: [_jsxs("div", { children: [_jsx("span", { className: "hero-kicker", children: "Your personal study cockpit" }), _jsxs("h2", { children: ["From notes to ", _jsx("em", { children: "mastery" }), " in minutes."] }), _jsx("p", { children: "Generate focused quizzes and flashcards, practise instantly, and keep your progress in one place." })] }), _jsxs("div", { className: "hero-metrics", children: [_jsxs("span", { children: [_jsx("b", { children: "AI" }), _jsx("small", { children: "Generated" })] }), _jsxs("span", { children: [_jsx("b", { children: "3D" }), _jsx("small", { children: "Flashcards" })] }), _jsxs("span", { children: [_jsx("b", { children: "Live" }), _jsx("small", { children: "Feedback" })] })] })] })), status === 'success' && data && !isInputExpanded && (_jsxs("div", { className: "active-session-bar", children: [_jsxs("div", { className: "session-info", children: [_jsx("span", { className: "session-status-dot", "aria-hidden": "true" }), _jsx("span", { className: "session-label", children: "Active Deck:" }), _jsx("span", { className: "session-title", children: data.title }), _jsx("span", { className: "session-pill", children: data.mode })] }), _jsxs("div", { className: "session-actions", children: [_jsx("button", { type: "button", className: "secondary-btn session-action-btn", onClick: handleEditNotes, "aria-label": "Edit study notes or change settings", children: "\u270F\uFE0F Edit Notes" }), _jsx("button", { type: "button", className: "secondary-btn session-action-btn text-muted-btn", onClick: handleNewTopic, "aria-label": "Start fresh with a new topic", children: "+ New Set" })] })] })), (isInputExpanded || status !== 'success') && (_jsx(PromptInput, { input: input, setInput: setInput, mode: mode, setMode: setMode, count: count, setCount: setCount, onSubmit: handleGenerate, isLoading: status === 'loading' })), _jsxs("div", { className: "status-display-region", children: [status === 'loading' && (_jsx(LoadingState, { mode: mode, onCancel: cancel })), status === 'error' && error && (_jsx(ErrorState, { error: error, onRetry: retry, onEditInput: handleEditNotes })), status === 'idle' && !data && (_jsx(EmptyState, { onSelectPrompt: handleSelectExample })), status === 'success' && data && (_jsx(ErrorBoundary, { onReset: retry, children: _jsx(ResultView, { deck: data, droppedCount: droppedCount, onNewTopic: handleNewTopic, onSaveProgress: setProgressState, initialProgress: progressState }) }))] })] }) }), _jsx(KeyboardShortcutsModal, { isOpen: isShortcutsOpen, onClose: () => setIsShortcutsOpen(false) }), _jsx("footer", { className: "app-footer", children: _jsxs("div", { className: "footer-inner", children: [_jsx("p", { className: "footer-copy", children: "StudyForge \u2014 Flam Frontend Internship Assignment \u2022 Built with React 18 & TypeScript" }), _jsx("div", { className: "footer-links", children: _jsxs("span", { className: "footer-hint-text", children: ["Press ", _jsx("kbd", { className: "mini-kbd", children: "?" }), " for shortcuts"] }) })] }) })] }));
}
