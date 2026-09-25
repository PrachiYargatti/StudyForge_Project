import { describe, it, expect } from 'vitest';
import { validateResult } from '../src/lib/validateResult';
describe('localStorage session re-validation', () => {
    it('safely validates and restores a valid stored flashcard deck', () => {
        const storedSession = {
            title: 'Stored Photosynthesis Set',
            mode: 'flashcards',
            cards: [
                { question: 'What is Chlorophyll?', answer: 'Green photosynthetic pigment' },
            ],
        };
        const validated = validateResult(storedSession, 'flashcards');
        expect(validated.ok).toBe(true);
        if (validated.ok) {
            expect(validated.data.title).toBe('Stored Photosynthesis Set');
            if (validated.data.mode === 'flashcards') {
                expect(validated.data.cards).toHaveLength(1);
            }
        }
    });
    it('rejects corrupted or tampered stored data without crashing', () => {
        const corruptedSession = {
            title: 'Tampered Deck',
            mode: 'flashcards',
            cards: 'not-an-array-of-cards',
        };
        const validated = validateResult(corruptedSession, 'flashcards');
        expect(validated.ok).toBe(false);
        if (!validated.ok) {
            expect(validated.error.code).toBe('VALIDATION_ERROR');
        }
    });
});
