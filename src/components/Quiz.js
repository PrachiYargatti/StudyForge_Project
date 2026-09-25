import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReducer, useEffect, useCallback } from 'react';
import { QuizResults } from './QuizResults';
function quizReducer(state, action) {
    switch (action.type) {
        case 'SELECT_OPTION': {
            // Prevent selecting if already answered for current question
            if (state.selectedOption !== null)
                return state;
            const currentQ = state.activeQuestions[state.currentIndex];
            if (!currentQ)
                return state;
            const isCorrect = action.payload.optionIndex === currentQ.correctIndex;
            return {
                ...state,
                selectedOption: action.payload.optionIndex,
                answers: {
                    ...state.answers,
                    [currentQ.id]: {
                        choiceIndex: action.payload.optionIndex,
                        isCorrect,
                    },
                },
            };
        }
        case 'NEXT_QUESTION': {
            const nextIndex = state.currentIndex + 1;
            const isNowCompleted = nextIndex >= state.activeQuestions.length;
            return {
                ...state,
                currentIndex: nextIndex,
                selectedOption: null,
                isCompleted: isNowCompleted,
            };
        }
        case 'RETEST_WRONG': {
            // Filter questions answered incorrectly in this round
            const wrong = state.activeQuestions.filter((q) => state.answers[q.id] && !state.answers[q.id].isCorrect);
            if (wrong.length === 0)
                return state;
            return {
                ...state,
                activeQuestions: wrong,
                currentIndex: 0,
                selectedOption: null,
                answers: {},
                round: state.round + 1,
                isCompleted: false,
            };
        }
        case 'RESTART_ALL':
            return {
                ...state,
                activeQuestions: state.allOriginalQuestions,
                currentIndex: 0,
                selectedOption: null,
                answers: {},
                round: 1,
                isCompleted: false,
            };
        case 'RESTORE_STATE':
            return action.payload;
        default:
            return state;
    }
}
/**
 * Quiz Component
 *
 * Renders interactive multiple-choice questions:
 * - One question at a time
 * - Large, touch-friendly option buttons (>= 44px)
 * - Immediate feedback with green/red highlighting
 * - Contextual explanation of why the answer is correct
 * - Live score counter and progress bar
 * - Retest wrong questions derived purely from client state
 */
export function Quiz({ deck, onNewTopic, onSaveProgress, initialProgress, }) {
    const [state, dispatch] = useReducer(quizReducer, {
        activeQuestions: deck.questions,
        allOriginalQuestions: deck.questions,
        currentIndex: 0,
        selectedOption: null,
        answers: {},
        round: 1,
        isCompleted: false,
    });
    // Restore initial progress if available
    useEffect(() => {
        if (initialProgress && initialProgress.deckId === deck.id) {
            dispatch({ type: 'RESTORE_STATE', payload: initialProgress.quizState });
        }
    }, [deck.id, initialProgress]);
    // Persist progress to optional callback
    useEffect(() => {
        if (onSaveProgress) {
            onSaveProgress({
                deckId: deck.id,
                quizState: state,
            });
        }
    }, [state, deck.id, onSaveProgress]);
    const { activeQuestions, currentIndex, selectedOption, answers, round, isCompleted } = state;
    const totalQuestions = activeQuestions.length;
    const currentQ = activeQuestions[currentIndex];
    const hasAnsweredCurrent = selectedOption !== null;
    // Running score
    const correctSoFar = Object.values(answers).filter((a) => a.isCorrect).length;
    const answeredCount = Object.keys(answers).length;
    // Keyboard navigation: 1-4 for options, Enter/Space for next
    const handleKeyDown = useCallback((e) => {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
            return;
        }
        if (isCompleted || !currentQ)
            return;
        // Number keys 1-4 to select options
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= currentQ.options.length) {
            if (!hasAnsweredCurrent) {
                e.preventDefault();
                dispatch({ type: 'SELECT_OPTION', payload: { optionIndex: num - 1 } });
            }
        }
        // Enter or Space to advance after answering
        if ((e.key === 'Enter' || e.code === 'Space') && hasAnsweredCurrent) {
            e.preventDefault();
            dispatch({ type: 'NEXT_QUESTION' });
        }
    }, [isCompleted, currentQ, hasAnsweredCurrent]);
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    // When all questions in the round are answered, show the results screen
    if (isCompleted) {
        return (_jsx(QuizResults, { questions: activeQuestions, answers: answers, round: round, onRetestWrong: () => dispatch({ type: 'RETEST_WRONG' }), onRestartFull: () => dispatch({ type: 'RESTART_ALL' }), onNewTopic: onNewTopic }));
    }
    const progressPercent = Math.round((currentIndex / totalQuestions) * 100);
    return (_jsxs("section", { className: "quiz-section", "aria-labelledby": "quiz-question-title", children: [_jsxs("div", { className: "quiz-header", children: [_jsxs("div", { className: "quiz-meta", children: [_jsxs("span", { className: "quiz-round-pill", children: ["Round ", round, totalQuestions !== deck.questions.length && ` (${totalQuestions} questions remaining)`] }), _jsx("h2", { id: "quiz-title", className: "quiz-title", children: deck.title })] }), _jsxs("div", { className: "quiz-score-pill", "aria-live": "polite", children: [_jsx("span", { className: "score-label", children: "Score:" }), _jsxs("span", { className: "score-value", children: [_jsx("strong", { children: correctSoFar }), " / ", answeredCount] })] })] }), _jsxs("div", { className: "quiz-progress-container", children: [_jsxs("div", { className: "progress-info", children: [_jsxs("span", { className: "progress-text", children: ["Question ", _jsx("strong", { children: currentIndex + 1 }), " of ", _jsx("strong", { children: totalQuestions })] }), _jsxs("span", { className: "progress-remaining", children: [totalQuestions - currentIndex - 1, " remaining"] })] }), _jsx("div", { className: "progress-bar-track", role: "progressbar", "aria-valuenow": currentIndex + 1, "aria-valuemin": 1, "aria-valuemax": totalQuestions, children: _jsx("div", { className: "progress-bar-fill", style: { width: `${progressPercent}%` } }) })] }), _jsxs("div", { className: "quiz-question-card", children: [_jsxs("div", { className: "question-content", children: [_jsxs("span", { className: "question-number-badge", children: ["Q", currentIndex + 1] }), _jsx("h3", { id: "quiz-question-title", className: "question-text", children: currentQ?.question })] }), _jsx("div", { className: "quiz-options-list", role: "radiogroup", "aria-labelledby": "quiz-question-title", children: currentQ?.options.map((optionText, optIndex) => {
                            const isSelected = selectedOption === optIndex;
                            const isCorrectAnswer = currentQ.correctIndex === optIndex;
                            // Determine status style when answered
                            let optionClass = 'quiz-option-btn';
                            if (hasAnsweredCurrent) {
                                if (isCorrectAnswer) {
                                    optionClass += ' option-correct';
                                }
                                else if (isSelected) {
                                    optionClass += ' option-incorrect';
                                }
                                else {
                                    optionClass += ' option-dimmed';
                                }
                            }
                            return (_jsxs("button", { type: "button", className: optionClass, onClick: () => dispatch({ type: 'SELECT_OPTION', payload: { optionIndex: optIndex } }), disabled: hasAnsweredCurrent, "aria-checked": isSelected, role: "radio", children: [_jsx("span", { className: "option-index-badge", children: String.fromCharCode(65 + optIndex) }), _jsx("span", { className: "option-label-text", children: optionText }), hasAnsweredCurrent && isCorrectAnswer && (_jsx("span", { className: "option-status-icon correct-icon", "aria-label": "Correct answer", children: "\u2713" })), hasAnsweredCurrent && isSelected && !isCorrectAnswer && (_jsx("span", { className: "option-status-icon incorrect-icon", "aria-label": "Incorrect answer", children: "\u2717" })), _jsx("kbd", { className: "key-hint option-key-hint", children: optIndex + 1 })] }, optIndex));
                        }) }), hasAnsweredCurrent && (_jsxs("div", { className: `feedback-box ${selectedOption === currentQ.correctIndex ? 'feedback-correct' : 'feedback-wrong'}`, role: "status", "aria-live": "polite", children: [_jsx("div", { className: "feedback-header", children: _jsx("span", { className: "feedback-status-badge", children: selectedOption === currentQ.correctIndex
                                        ? '✓ Correct!'
                                        : `✗ Incorrect — Correct answer is: ${String.fromCharCode(65 + currentQ.correctIndex)}. ${currentQ.options[currentQ.correctIndex]}` }) }), currentQ.explanation && (_jsxs("p", { className: "feedback-explanation", children: [_jsx("strong", { children: "Explanation: " }), currentQ.explanation] })), _jsx("div", { className: "feedback-footer", children: _jsxs("button", { type: "button", className: "primary-btn next-question-btn", onClick: () => dispatch({ type: 'NEXT_QUESTION' }), "aria-label": currentIndex + 1 === totalQuestions ? 'View Quiz Results' : 'Next Question', children: [_jsx("span", { children: currentIndex + 1 === totalQuestions ? 'View Results 🏆' : 'Next Question →' }), _jsx("kbd", { className: "key-hint", children: "\u21B5" })] }) })] }))] })] }));
}
export default Quiz;
