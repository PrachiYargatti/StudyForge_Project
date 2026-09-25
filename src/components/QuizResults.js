import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * QuizResults
 *
 * Displays end-of-quiz score summary and breakdown:
 * - Accuracy percentage & ratio
 * - Review list of questions answered incorrectly with correct answers & explanations
 * - "Re-test Wrong Answers" button (creates a client-side round with only missed questions)
 * - "Restart Full Quiz" and "New Topic" actions
 */
export function QuizResults({ questions, answers, round, onRetestWrong, onRestartFull, onNewTopic, }) {
    const totalQuestions = questions.length;
    const correctCount = questions.filter((q) => answers[q.id]?.isCorrect).length;
    const wrongQuestions = questions.filter((q) => answers[q.id] && !answers[q.id].isCorrect);
    const accuracy = Math.round((correctCount / totalQuestions) * 100) || 0;
    const isPerfect = accuracy === 100;
    const hasWrongAnswers = wrongQuestions.length > 0;
    return (_jsxs("div", { className: "quiz-results-card", role: "region", "aria-label": "Quiz Results Summary", children: [_jsxs("div", { className: "results-hero", children: [_jsx("div", { className: "results-trophy", "aria-hidden": "true", children: isPerfect ? '🏆' : accuracy >= 70 ? '🎯' : '💡' }), _jsx("h3", { className: "results-title", children: isPerfect
                            ? 'Perfect Score!'
                            : `Round ${round} Complete` }), _jsx("p", { className: "results-subtitle", children: isPerfect
                            ? 'You mastered all questions in this round without a single mistake!'
                            : `You scored ${correctCount} out of ${totalQuestions}. Review your missed questions below.` }), _jsxs("div", { className: "results-score-grid", children: [_jsxs("div", { className: "score-stat-box accent-box", children: [_jsxs("span", { className: "score-stat-val", children: [accuracy, "%"] }), _jsx("span", { className: "score-stat-lbl", children: "Final Score" })] }), _jsxs("div", { className: "score-stat-box correct-box", children: [_jsx("span", { className: "score-stat-val", children: correctCount }), _jsx("span", { className: "score-stat-lbl", children: "Correct" })] }), _jsxs("div", { className: "score-stat-box wrong-box", children: [_jsx("span", { className: "score-stat-val", children: wrongQuestions.length }), _jsx("span", { className: "score-stat-lbl", children: "To Review" })] })] })] }), _jsxs("div", { className: "results-actions-bar", children: [hasWrongAnswers && (_jsxs("button", { type: "button", className: "primary-btn retest-btn", onClick: onRetestWrong, "aria-label": `Retest the ${wrongQuestions.length} questions answered incorrectly`, children: [_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("polyline", { points: "23 4 23 10 17 10" }), _jsx("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" })] }), _jsxs("span", { children: ["Re-test Wrong Answers (", wrongQuestions.length, ")"] })] })), _jsxs("button", { type: "button", className: "secondary-btn", onClick: onRestartFull, "aria-label": "Restart the entire quiz from the beginning", children: [_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("polyline", { points: "1 4 1 10 7 10" }), _jsx("path", { d: "M3.51 15a9 9 0 1 0 2.13-9.36L1 10" })] }), _jsx("span", { children: "Restart Full Quiz" })] }), _jsx("button", { type: "button", className: "secondary-btn text-muted-btn", onClick: onNewTopic, "aria-label": "Start a new study topic", children: _jsx("span", { children: "+ New Topic" }) })] }), hasWrongAnswers && (_jsxs("div", { className: "wrong-answers-review-section", children: [_jsxs("h4", { className: "review-heading", children: ["Review Questions to Improve (", wrongQuestions.length, ")"] }), _jsx("div", { className: "review-list", children: wrongQuestions.map((q, idx) => {
                            const record = answers[q.id];
                            const userChoice = record ? q.options[record.choiceIndex] : 'No answer';
                            const correctChoice = q.options[q.correctIndex];
                            return (_jsxs("div", { className: "review-item-card", children: [_jsxs("div", { className: "review-item-header", children: [_jsxs("span", { className: "review-question-num", children: ["Question ", idx + 1] }), _jsx("span", { className: "review-badge-wrong", children: "Needs Review" })] }), _jsx("p", { className: "review-question-text", children: q.question }), _jsxs("div", { className: "review-answers-comparison", children: [_jsxs("div", { className: "answer-row user-wrong-answer", children: [_jsx("span", { className: "answer-label", children: "Your Answer:" }), _jsxs("span", { className: "answer-content", children: ["\u2717 ", userChoice] })] }), _jsxs("div", { className: "answer-row correct-answer", children: [_jsx("span", { className: "answer-label", children: "Correct Answer:" }), _jsxs("span", { className: "answer-content", children: ["\u2713 ", correctChoice] })] })] }), q.explanation && (_jsxs("div", { className: "review-explanation", children: [_jsx("span", { className: "explanation-icon", "aria-hidden": "true", children: "\uD83D\uDCA1" }), _jsx("p", { className: "explanation-text", children: q.explanation })] }))] }, q.id));
                        }) })] }))] }));
}
export default QuizResults;
