import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useState } from 'react';
const MAX_CHARS = 8000;
const ACCEPTED_FILES = '*/*';
export function PromptInput({ input, setInput, mode, setMode, count, setCount, onSubmit, isLoading, }) {
    const [isFocused, setIsFocused] = useState(false);
    const [fileName, setFileName] = useState('');
    const [fileError, setFileError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const charCount = input.length;
    const isOverLimit = charCount > MAX_CHARS;
    const isNearLimit = charCount > MAX_CHARS * 0.9;
    const isSubmitDisabled = input.trim().length === 0 || isLoading || isOverLimit;
    const readFile = async (file) => {
        setFileError('');
        if (file.size > 2 * 1024 * 1024) {
            setFileError('Files must be smaller than 2 MB.');
            return;
        }
        try {
            const text = (await file.text()).replace(/\u0000/g, '').trim();
            if (!text) {
                setFileError('This file has no readable text. For scans or binary office files, paste extracted text or export as TXT.');
                return;
            }
            setInput(text.slice(0, MAX_CHARS));
            setFileName(file.name);
        }
        catch {
            setFileError('Could not extract readable text from this file. Try exporting it as TXT, PDF text, or Markdown.');
        }
    };
    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!isSubmitDisabled)
                onSubmit();
        }
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file)
            void readFile(file);
    };
    return (_jsxs("section", { className: "prompt-input-card", "aria-labelledby": "input-heading", children: [_jsxs("div", { className: "prompt-header", children: [_jsxs("div", { children: [_jsx("div", { className: "eyebrow", children: "AI-powered learning workspace" }), _jsx("h2", { id: "input-heading", className: "prompt-title", children: "Turn your material into a study session" }), _jsx("p", { className: "prompt-subtitle", children: "Paste notes, upload a text document, then generate an interactive quiz or flashcard deck." })] }), _jsxs("div", { className: "prompt-live-badge", children: [_jsx("span", {}), " AI ready"] })] }), _jsxs("form", { onSubmit: (e) => { e.preventDefault(); if (!isSubmitDisabled)
                    onSubmit(); }, className: "prompt-form", children: [_jsxs("div", { className: `textarea-container ${isFocused ? 'focused' : ''} ${isOverLimit ? 'over-limit' : ''} ${isDragging ? 'dragging' : ''}`, onDragOver: (e) => { e.preventDefault(); setIsDragging(true); }, onDragLeave: () => setIsDragging(false), onDrop: handleDrop, children: [_jsx("label", { htmlFor: "study-notes-input", className: "sr-only", children: "Study notes or topic input" }), _jsx("textarea", { id: "study-notes-input", rows: 7, value: input, onChange: (e) => { setInput(e.target.value); setFileName(''); setFileError(''); }, onKeyDown: handleKeyDown, onFocus: () => setIsFocused(true), onBlur: () => setIsFocused(false), placeholder: "Try: Operating Systems process scheduling, or paste your lecture notes here...", disabled: isLoading, maxLength: MAX_CHARS + 50, "aria-describedby": "char-count-info" }), _jsxs("div", { className: "textarea-footer", children: [_jsxs("span", { id: "char-count-info", className: `char-counter ${isNearLimit ? 'counter-warning' : ''} ${isOverLimit ? 'counter-danger' : ''}`, children: [charCount.toLocaleString(), " / ", MAX_CHARS.toLocaleString()] }), input.length > 0 && !isLoading && (_jsx("button", { type: "button", className: "clear-button", onClick: () => { setInput(''); setFileName(''); }, children: "Clear" }))] }), isDragging && _jsx("div", { className: "drop-overlay", children: "Drop your study file here" })] }), _jsxs("div", { className: "upload-row", children: [_jsx("input", { ref: fileInputRef, type: "file", accept: ACCEPTED_FILES, className: "sr-only", onChange: (e) => { const file = e.target.files?.[0]; if (file)
                                    void readFile(file); e.currentTarget.value = ''; } }), _jsxs("button", { type: "button", className: "upload-button", onClick: () => fileInputRef.current?.click(), disabled: isLoading, children: [_jsx("span", { className: "upload-icon", children: "\u2191" }), _jsx("span", { children: "Upload study file" })] }), _jsx("span", { className: "upload-help", children: "TXT \u00B7 MD \u00B7 CSV \u00B7 JSON \u00B7 HTML \u00B7 LOG \u00B7 max 2 MB" }), fileName && _jsxs("span", { className: "file-chip", title: fileName, children: ["\u2713 ", fileName] })] }), fileError && _jsx("div", { className: "upload-error", role: "alert", children: fileError }), _jsxs("div", { className: "prompt-options-row", children: [_jsxs("div", { className: "option-group", role: "group", "aria-labelledby": "mode-label", children: [_jsx("span", { id: "mode-label", className: "option-label", children: "Study mode" }), _jsxs("div", { className: "mode-toggle-group", children: [_jsxs("button", { type: "button", className: `mode-pill ${mode === 'flashcards' ? 'active' : ''}`, onClick: () => setMode('flashcards'), disabled: isLoading, "aria-pressed": mode === 'flashcards', children: [_jsx("span", { children: "\u25A3" }), _jsx("span", { children: "Flashcards" })] }), _jsxs("button", { type: "button", className: `mode-pill ${mode === 'quiz' ? 'active' : ''}`, onClick: () => setMode('quiz'), disabled: isLoading, "aria-pressed": mode === 'quiz', children: [_jsx("span", { children: "?" }), _jsx("span", { children: "Quiz" })] })] })] }), _jsxs("div", { className: "option-group", children: [_jsx("label", { htmlFor: "count-select", className: "option-label", children: "Items" }), _jsxs("select", { id: "count-select", value: count, onChange: (e) => setCount(Number(e.target.value)), disabled: isLoading, className: "count-select", children: [_jsx("option", { value: 5, children: "5 items" }), _jsx("option", { value: 8, children: "8 items" }), _jsx("option", { value: 10, children: "10 items" }), _jsx("option", { value: 15, children: "15 items" })] })] }), _jsx("button", { type: "submit", className: "submit-btn primary-btn", disabled: isSubmitDisabled, "aria-busy": isLoading, children: isLoading ? _jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-inline" }), _jsx("span", { children: "Building session\u2026" })] }) : _jsxs(_Fragment, { children: [_jsxs("span", { children: ["Generate ", mode === 'quiz' ? 'Quiz' : 'Cards'] }), _jsx("span", { className: "button-arrow", children: "\u2192" })] }) })] })] })] }));
}
export default PromptInput;
