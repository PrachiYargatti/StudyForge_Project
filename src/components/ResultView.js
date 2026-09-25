import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FlashcardDeck } from './FlashcardDeck';
import { Quiz } from './Quiz';
/**
 * ResultView
 *
 * Routes validated study data to either FlashcardDeck or Quiz.
 * Displays a partial validity notice banner if some items were dropped during validation.
 */
export function ResultView({ deck, droppedCount, onNewTopic, onSaveProgress, initialProgress, }) {
    return (_jsxs("div", { className: "result-view-container", children: [droppedCount > 0 && (_jsxs("div", { className: "partial-notice-banner", role: "status", children: [_jsx("div", { className: "partial-notice-icon", "aria-hidden": "true", children: "\u26A0\uFE0F" }), _jsxs("div", { className: "partial-notice-content", children: [_jsx("strong", { children: "Notice on AI Output: " }), _jsxs("span", { children: [droppedCount, " ", droppedCount === 1 ? 'item was' : 'items were', " skipped because the AI returned ", droppedCount === 1 ? 'it' : 'them', " incorrectly. We preserved the remaining", ' ', deck.mode === 'flashcards' ? deck.cards.length : deck.questions.length, " valid", ' ', deck.mode === 'flashcards' ? 'cards' : 'questions', " for you."] })] })] })), deck.mode === 'flashcards' ? (_jsx(FlashcardDeck, { deck: deck, onNewTopic: onNewTopic, onSaveProgress: onSaveProgress, initialProgress: initialProgress }, deck.id)) : (_jsx(Quiz, { deck: deck, onNewTopic: onNewTopic, onSaveProgress: onSaveProgress, initialProgress: initialProgress }, deck.id))] }));
}
export default ResultView;
