const MAX_ITEMS = 30;
const MAX_TITLE_LENGTH = 120;
const MAX_TEXT_LENGTH = 1000;
/**
 * Validates and sanitizes the parsed output from the LLM.
 *
 * Design choices explained for interview:
 * 1. "Drop invalid items, keep valid ones":
 *    If an LLM produces 8 questions and 1 is slightly malformed (e.g. correctIndex out of bounds),
 *    dropping the 1 bad question leaves the user with 7 good questions rather than a complete failure.
 *    We notify the user of dropped items via `droppedCount`.
 * 2. "Error on zero valid items":
 *    If no items meet the schema, we fail safely with a friendly error and retry option.
 * 3. "Assign stable client-side IDs":
 *    We never trust the model to provide stable, unique IDs. Stable IDs ensure React keys and
 *    state tracking (known/missed, quiz score) work reliably.
 * 4. "Cap and trim strings":
 *    Ensures excessive text or rogue formatting does not break UI layouts.
 */
export function validateResult(raw, requestedMode) {
    // 1. Top-level object verification
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return {
            ok: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: "The AI's response wasn't in the expected format. Please try again.",
                details: 'Expected a top-level JSON object.',
            },
        };
    }
    const obj = raw;
    // 2. Mode check
    if (obj.mode && typeof obj.mode === 'string' && obj.mode.toLowerCase() !== requestedMode) {
        return {
            ok: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: `The AI returned a ${obj.mode} set instead of ${requestedMode}. Please try again.`,
                details: `Expected mode "${requestedMode}", but got "${obj.mode}".`,
            },
        };
    }
    // 3. Title sanitization
    let title = 'Study Set';
    if (typeof obj.title === 'string' && obj.title.trim().length > 0) {
        title = obj.title.trim().slice(0, MAX_TITLE_LENGTH);
    }
    const deckId = `deck-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    // 4. Validate Flashcards Mode
    if (requestedMode === 'flashcards') {
        const rawCards = obj.cards;
        if (!Array.isArray(rawCards) || rawCards.length === 0) {
            return {
                ok: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: "The AI's response was missing the flashcard list. Please try again.",
                    details: 'Expected "cards" array in response object.',
                },
            };
        }
        const validCards = [];
        let droppedCount = 0;
        for (let i = 0; i < rawCards.length && validCards.length < MAX_ITEMS; i++) {
            const card = rawCards[i];
            if (!card || typeof card !== 'object' || Array.isArray(card)) {
                droppedCount++;
                continue;
            }
            const question = typeof card.question === 'string' ? card.question.trim().slice(0, MAX_TEXT_LENGTH) : '';
            const answer = typeof card.answer === 'string' ? card.answer.trim().slice(0, MAX_TEXT_LENGTH) : '';
            const hint = typeof card.hint === 'string' && card.hint.trim().length > 0
                ? card.hint.trim().slice(0, MAX_TEXT_LENGTH)
                : undefined;
            // Both question and answer must be non-empty strings
            if (question.length === 0 || answer.length === 0) {
                droppedCount++;
                continue;
            }
            validCards.push({
                id: `card-${validCards.length + 1}-${Math.random().toString(36).substring(2, 7)}`,
                question,
                answer,
                hint,
            });
        }
        // Account for any remaining items beyond MAX_ITEMS as dropped
        if (rawCards.length > MAX_ITEMS) {
            droppedCount += (rawCards.length - MAX_ITEMS);
        }
        if (validCards.length === 0) {
            return {
                ok: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'The AI did not generate any usable flashcards. Please try again.',
                    details: 'Zero valid cards passed schema validation.',
                },
            };
        }
        const deck = {
            id: deckId,
            title,
            mode: 'flashcards',
            cards: validCards,
        };
        return {
            ok: true,
            data: deck,
            droppedCount,
        };
    }
    // 5. Validate Quiz Mode
    if (requestedMode === 'quiz') {
        const rawQuestions = obj.questions;
        if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
            return {
                ok: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: "The AI's response was missing the questions list. Please try again.",
                    details: 'Expected "questions" array in response object.',
                },
            };
        }
        const validQuestions = [];
        let droppedCount = 0;
        for (let i = 0; i < rawQuestions.length && validQuestions.length < MAX_ITEMS; i++) {
            const q = rawQuestions[i];
            if (!q || typeof q !== 'object' || Array.isArray(q)) {
                droppedCount++;
                continue;
            }
            const questionText = typeof q.question === 'string' ? q.question.trim().slice(0, MAX_TEXT_LENGTH) : '';
            if (questionText.length === 0) {
                droppedCount++;
                continue;
            }
            // Options must be an array of 2 to 6 non-empty strings
            if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 6) {
                droppedCount++;
                continue;
            }
            const trimmedOptions = [];
            let hasInvalidOption = false;
            for (const opt of q.options) {
                if (typeof opt !== 'string' || opt.trim().length === 0) {
                    hasInvalidOption = true;
                    break;
                }
                trimmedOptions.push(opt.trim().slice(0, MAX_TEXT_LENGTH));
            }
            if (hasInvalidOption) {
                droppedCount++;
                continue;
            }
            // Check for unique options
            const uniqueOptions = Array.from(new Set(trimmedOptions));
            if (uniqueOptions.length < 2) {
                droppedCount++;
                continue;
            }
            // Validate correctIndex integer within bounds
            const correctIndex = Number(q.correctIndex);
            if (!Number.isInteger(correctIndex) ||
                correctIndex < 0 ||
                correctIndex >= trimmedOptions.length) {
                droppedCount++;
                continue;
            }
            const explanation = typeof q.explanation === 'string' && q.explanation.trim().length > 0
                ? q.explanation.trim().slice(0, MAX_TEXT_LENGTH)
                : undefined;
            validQuestions.push({
                id: `quiz-${validQuestions.length + 1}-${Math.random().toString(36).substring(2, 7)}`,
                question: questionText,
                options: trimmedOptions,
                correctIndex,
                explanation,
            });
        }
        if (rawQuestions.length > MAX_ITEMS) {
            droppedCount += (rawQuestions.length - MAX_ITEMS);
        }
        if (validQuestions.length === 0) {
            return {
                ok: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'The AI did not generate any usable quiz questions. Please try again.',
                    details: 'Zero valid questions passed schema validation.',
                },
            };
        }
        const deck = {
            id: deckId,
            title,
            mode: 'quiz',
            questions: validQuestions,
        };
        return {
            ok: true,
            data: deck,
            droppedCount,
        };
    }
    return {
        ok: false,
        error: {
            code: 'VALIDATION_ERROR',
            message: 'Unknown study mode requested.',
        },
    };
}
