import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReducer, useEffect, useCallback } from 'react';
function deckReducer(state, action) {
    switch (action.type) {
        case 'FLIP':
            return {
                ...state,
                isFlipped: !state.isFlipped,
            };
        case 'NEXT': {
            const nextIndex = Math.min(state.currentIndex + 1, state.activeCards.length);
            return {
                ...state,
                currentIndex: nextIndex,
                isFlipped: false,
                showHint: false,
            };
        }
        case 'PREV': {
            const prevIndex = Math.max(state.currentIndex - 1, 0);
            return {
                ...state,
                currentIndex: prevIndex,
                isFlipped: false,
                showHint: false,
            };
        }
        case 'RATE_AND_ADVANCE': {
            const updatedRatings = {
                ...state.ratings,
                [action.payload.cardId]: action.payload.rating,
            };
            const nextIndex = Math.min(state.currentIndex + 1, state.activeCards.length);
            return {
                ...state,
                ratings: updatedRatings,
                currentIndex: nextIndex,
                isFlipped: false,
                showHint: false,
            };
        }
        case 'TOGGLE_HINT':
            return {
                ...state,
                showHint: !state.showHint,
            };
        case 'SHUFFLE': {
            const shuffled = [...state.activeCards].sort(() => Math.random() - 0.5);
            return {
                ...state,
                activeCards: shuffled,
                currentIndex: 0,
                isFlipped: false,
                showHint: false,
            };
        }
        case 'STUDY_MISSED_ONLY': {
            // Filter only cards that were marked as missed in this round
            const missedCards = state.activeCards.filter((card) => state.ratings[card.id] === 'missed');
            if (missedCards.length === 0)
                return state;
            return {
                ...state,
                activeCards: missedCards,
                currentIndex: 0,
                isFlipped: false,
                ratings: {},
                round: state.round + 1,
                showHint: false,
            };
        }
        case 'RESTART_ALL':
            return {
                ...state,
                activeCards: state.allOriginalCards,
                currentIndex: 0,
                isFlipped: false,
                ratings: {},
                round: 1,
                showHint: false,
            };
        case 'RESTORE_STATE':
            return action.payload;
        default:
            return state;
    }
}
/**
 * FlashcardDeck
 *
 * Provides a 3D-flipping flashcard study experience:
 * - Click, Tap, or Space/Enter to flip
 * - Got it (Known) vs Missed tracking
 * - Summary screen upon completing the deck
 * - "Study Missed Only" rounds derived purely from client state
 * - Keyboard navigation (Left/Right arrows, Space, 1 for Got It, 2 for Missed)
 */
export function FlashcardDeck({ deck, onNewTopic, onSaveProgress, initialProgress, }) {
    const [state, dispatch] = useReducer(deckReducer, {
        activeCards: deck.cards,
        allOriginalCards: deck.cards,
        currentIndex: 0,
        isFlipped: false,
        ratings: {},
        round: 1,
        showHint: false,
    });
    // Restore initial progress if available from localStorage
    useEffect(() => {
        if (initialProgress && initialProgress.deckId === deck.id) {
            dispatch({ type: 'RESTORE_STATE', payload: initialProgress.deckState });
        }
    }, [deck.id, initialProgress]);
    // Notify parent of progress changes for optional localStorage persistence
    useEffect(() => {
        if (onSaveProgress) {
            onSaveProgress({
                deckId: deck.id,
                deckState: state,
            });
        }
    }, [state, deck.id, onSaveProgress]);
    const { activeCards, currentIndex, isFlipped, ratings, round, showHint } = state;
    const totalCards = activeCards.length;
    const isCompleted = currentIndex >= totalCards;
    const currentCard = activeCards[currentIndex];
    const knownCount = Object.values(ratings).filter((r) => r === 'known').length;
    const missedCount = Object.values(ratings).filter((r) => r === 'missed').length;
    // Keyboard navigation
    const handleKeyDown = useCallback((e) => {
        // Don't intercept if user is typing in a textarea or input
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
            return;
        }
        if (isCompleted)
            return;
        if (e.code === 'Space' || e.key === ' ') {
            e.preventDefault();
            dispatch({ type: 'FLIP' });
        }
        else if (e.key === 'ArrowRight') {
            e.preventDefault();
            dispatch({ type: 'NEXT' });
        }
        else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            dispatch({ type: 'PREV' });
        }
        else if (e.key === '1' && currentCard) {
            e.preventDefault();
            dispatch({ type: 'RATE_AND_ADVANCE', payload: { cardId: currentCard.id, rating: 'known' } });
        }
        else if (e.key === '2' && currentCard) {
            e.preventDefault();
            dispatch({ type: 'RATE_AND_ADVANCE', payload: { cardId: currentCard.id, rating: 'missed' } });
        }
    }, [isCompleted, currentCard]);
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    // Round summary view when all cards in current round have been traversed
    if (isCompleted) {
        const hasMissed = missedCount > 0;
        const accuracy = Math.round((knownCount / totalCards) * 100) || 0;
        return (_jsxs("div", { className: "study-summary-card", role: "region", "aria-label": "Deck Completion Summary", children: [_jsx("div", { className: "summary-badge-wrapper", children: _jsx("span", { className: "summary-trophy", "aria-hidden": "true", children: accuracy === 100 ? '🎉' : '📚' }) }), _jsx("h3", { className: "summary-title", children: accuracy === 100 ? 'Deck Mastered!' : `Round ${round} Complete` }), _jsx("p", { className: "summary-subtitle", children: accuracy === 100
                        ? 'Incredible job! You mastered every card in this set.'
                        : `You reviewed all ${totalCards} cards in this round.` }), _jsxs("div", { className: "summary-stats-grid", children: [_jsxs("div", { className: "stat-box known-box", children: [_jsx("span", { className: "stat-number", children: knownCount }), _jsx("span", { className: "stat-label", children: "Got It (Known)" })] }), _jsxs("div", { className: "stat-box missed-box", children: [_jsx("span", { className: "stat-number", children: missedCount }), _jsx("span", { className: "stat-label", children: "Needs Review (Missed)" })] }), _jsxs("div", { className: "stat-box accuracy-box", children: [_jsxs("span", { className: "stat-number", children: [accuracy, "%"] }), _jsx("span", { className: "stat-label", children: "Accuracy" })] })] }), _jsxs("div", { className: "summary-actions", children: [hasMissed && (_jsxs("button", { type: "button", className: "primary-btn study-missed-btn", onClick: () => dispatch({ type: 'STUDY_MISSED_ONLY' }), "aria-label": `Study only the ${missedCount} missed cards`, children: [_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("polyline", { points: "23 4 23 10 17 10" }), _jsx("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" })] }), _jsxs("span", { children: ["Study Missed Only (", missedCount, ")"] })] })), _jsxs("button", { type: "button", className: "secondary-btn", onClick: () => dispatch({ type: 'RESTART_ALL' }), "aria-label": "Restart deck from beginning with all cards", children: [_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("polyline", { points: "1 4 1 10 7 10" }), _jsx("path", { d: "M3.51 15a9 9 0 1 0 2.13-9.36L1 10" })] }), _jsx("span", { children: "Restart Full Deck" })] }), _jsx("button", { type: "button", className: "secondary-btn text-muted-btn", onClick: onNewTopic, "aria-label": "Create a new study set with a different topic", children: _jsx("span", { children: "+ New Topic" }) })] })] }));
    }
    // Active Flashcard View
    const progressPercent = Math.round((currentIndex / totalCards) * 100);
    const currentCardRating = currentCard ? ratings[currentCard.id] : undefined;
    return (_jsxs("section", { className: "flashcard-deck-section", "aria-labelledby": "deck-title", children: [_jsxs("div", { className: "deck-header", children: [_jsxs("div", { className: "deck-meta", children: [_jsxs("span", { className: "deck-round-pill", children: ["Round ", round, totalCards !== deck.cards.length && ` (${totalCards} cards remaining)`] }), _jsx("h2", { id: "deck-title", className: "deck-title", children: deck.title })] }), _jsxs("div", { className: "deck-controls-top", children: [_jsxs("button", { type: "button", className: "deck-icon-btn", onClick: () => dispatch({ type: 'SHUFFLE' }), title: "Shuffle cards", "aria-label": "Shuffle card order", children: [_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("polyline", { points: "16 3 21 3 21 8" }), _jsx("line", { x1: "4", y1: "20", x2: "21", y2: "3" }), _jsx("polyline", { points: "21 16 21 21 16 21" }), _jsx("line", { x1: "15", y1: "15", x2: "21", y2: "21" }), _jsx("line", { x1: "4", y1: "4", x2: "9", y2: "9" })] }), _jsx("span", { children: "Shuffle" })] }), _jsx("button", { type: "button", className: "deck-icon-btn", onClick: onNewTopic, title: "Start new topic", "aria-label": "Start new topic", children: _jsx("span", { children: "+ New Topic" }) })] })] }), _jsxs("div", { className: "deck-progress-container", children: [_jsxs("div", { className: "progress-info", children: [_jsxs("span", { className: "progress-text", children: ["Card ", _jsx("strong", { children: currentIndex + 1 }), " of ", _jsx("strong", { children: totalCards })] }), _jsxs("span", { className: "progress-counts", children: [_jsxs("span", { className: "tag-known", children: ["\u2713 ", knownCount] }), _jsxs("span", { className: "tag-missed", children: ["\u2717 ", missedCount] })] })] }), _jsx("div", { className: "progress-bar-track", role: "progressbar", "aria-valuenow": currentIndex + 1, "aria-valuemin": 1, "aria-valuemax": totalCards, children: _jsx("div", { className: "progress-bar-fill", style: { width: `${progressPercent}%` } }) })] }), _jsx("div", { className: "flashcard-stage", children: _jsxs("div", { className: `flashcard-wrapper ${isFlipped ? 'flipped' : ''}`, onClick: () => dispatch({ type: 'FLIP' }), role: "button", tabIndex: 0, "aria-label": `Flashcard: ${isFlipped ? 'Showing answer' : 'Showing question'}. Click or press Space to flip.`, onKeyDown: (e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            dispatch({ type: 'FLIP' });
                        }
                    }, children: [_jsxs("div", { className: "card-face card-front", children: [_jsx("div", { className: "card-badge", children: "Question" }), _jsxs("div", { className: "card-body", children: [_jsx("p", { className: "card-text", children: currentCard?.question }), currentCard?.hint && (_jsxs("div", { className: "hint-container", onClick: (e) => e.stopPropagation(), children: [_jsxs("button", { type: "button", className: "hint-toggle-btn", onClick: () => dispatch({ type: 'TOGGLE_HINT' }), "aria-expanded": showHint, children: ["\uD83D\uDCA1 ", showHint ? 'Hide Hint' : 'Show Hint'] }), showHint && _jsx("p", { className: "hint-text", children: currentCard.hint })] }))] }), _jsx("div", { className: "card-footer-hint", children: _jsx("span", { children: "Click or Space to flip \u21BA" }) })] }), _jsxs("div", { className: "card-face card-back", children: [_jsx("div", { className: "card-badge badge-answer", children: "Answer" }), _jsxs("div", { className: "card-body", children: [_jsx("p", { className: "card-text answer-text", children: currentCard?.answer }), _jsxs("div", { className: "card-front-recap", children: [_jsx("span", { className: "recap-label", children: "Prompt:" }), _jsx("span", { className: "recap-text", children: currentCard?.question })] })] }), _jsx("div", { className: "card-footer-hint", children: _jsx("span", { children: "Click or Space to flip back \u21BB" }) })] })] }) }), _jsxs("div", { className: "deck-action-bar", children: [_jsxs("div", { className: "rating-button-group", children: [_jsxs("button", { type: "button", className: `rating-btn missed-action-btn ${currentCardRating === 'missed' ? 'active' : ''}`, onClick: () => currentCard &&
                                    dispatch({ type: 'RATE_AND_ADVANCE', payload: { cardId: currentCard.id, rating: 'missed' } }), "aria-label": "Mark as missed / study again", children: [_jsx("span", { className: "btn-icon", children: "\u2717" }), _jsx("span", { children: "Missed" }), _jsx("kbd", { className: "key-hint", children: "2" })] }), _jsxs("button", { type: "button", className: `rating-btn known-action-btn ${currentCardRating === 'known' ? 'active' : ''}`, onClick: () => currentCard &&
                                    dispatch({ type: 'RATE_AND_ADVANCE', payload: { cardId: currentCard.id, rating: 'known' } }), "aria-label": "Mark as got it / known", children: [_jsx("span", { className: "btn-icon", children: "\u2713" }), _jsx("span", { children: "Got it" }), _jsx("kbd", { className: "key-hint", children: "1" })] })] }), _jsxs("div", { className: "navigation-group", children: [_jsx("button", { type: "button", className: "nav-btn prev-btn", onClick: () => dispatch({ type: 'PREV' }), disabled: currentIndex === 0, "aria-label": "Previous card", children: "\u2190 Prev" }), _jsx("button", { type: "button", className: "nav-btn next-btn", onClick: () => dispatch({ type: 'NEXT' }), "aria-label": "Next card", children: "Next \u2192" })] })] })] }));
}
export default FlashcardDeck;
