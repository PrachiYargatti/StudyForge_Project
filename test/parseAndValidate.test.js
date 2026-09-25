import { describe, it, expect } from 'vitest';
import { parseModelOutput } from '../src/lib/parseModelOutput';
import { validateResult } from '../src/lib/validateResult';
describe('parseModelOutput', () => {
    it('parses clean valid JSON correctly', () => {
        const raw = JSON.stringify({
            title: 'Solar System',
            mode: 'flashcards',
            cards: [{ question: 'What is Earth?', answer: 'The third planet from the Sun.' }],
        });
        const result = parseModelOutput(raw);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.title).toBe('Solar System');
        }
    });
    it('recovers JSON wrapped in markdown ```json code fences', () => {
        const raw = '```json\n{\n  "title": "Fenced Title",\n  "mode": "flashcards",\n  "cards": []\n}\n```';
        const result = parseModelOutput(raw);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.title).toBe('Fenced Title');
        }
    });
    it('recovers JSON with surrounding conversational prose', () => {
        const raw = 'Here is your generated study set!\n\n{\n  "title": "Prose Wrapped",\n  "mode": "flashcards",\n  "cards": []\n}\n\nHope this helps you study!';
        const result = parseModelOutput(raw);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.title).toBe('Prose Wrapped');
        }
    });
    it('returns EMPTY_RESPONSE error for empty or whitespace string', () => {
        const resultEmpty = parseModelOutput('');
        expect(resultEmpty.ok).toBe(false);
        if (!resultEmpty.ok) {
            expect(resultEmpty.error.code).toBe('EMPTY_RESPONSE');
        }
        const resultWhitespace = parseModelOutput('    \n\t  ');
        expect(resultWhitespace.ok).toBe(false);
        if (!resultWhitespace.ok) {
            expect(resultWhitespace.error.code).toBe('EMPTY_RESPONSE');
        }
    });
    it('returns PARSE_ERROR for unparseable malformed text', () => {
        const result = parseModelOutput('{"title": "Broken", "mode": "flashcards", "cards": [');
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe('PARSE_ERROR');
        }
    });
});
describe('validateResult', () => {
    describe('Flashcards Validation', () => {
        it('validates a correct flashcard deck and assigns stable IDs', () => {
            const payload = {
                title: 'Biology 101',
                mode: 'flashcards',
                cards: [
                    { question: 'What is Mitochondria?', answer: 'Powerhouse of the cell', hint: 'Energy' },
                    { question: 'What is Ribosome?', answer: 'Site of protein synthesis' },
                ],
            };
            const res = validateResult(payload, 'flashcards');
            expect(res.ok).toBe(true);
            if (res.ok && res.data.mode === 'flashcards') {
                expect(res.data.title).toBe('Biology 101');
                expect(res.data.cards).toHaveLength(2);
                expect(res.data.cards[0].id).toBeDefined();
                expect(res.data.cards[0].question).toBe('What is Mitochondria?');
                expect(res.data.cards[0].hint).toBe('Energy');
                expect(res.droppedCount).toBe(0);
            }
        });
        it('falls back to default title "Study Set" if title is missing or empty', () => {
            const payload = {
                mode: 'flashcards',
                cards: [{ question: 'Q', answer: 'A' }],
            };
            const res = validateResult(payload, 'flashcards');
            expect(res.ok).toBe(true);
            if (res.ok) {
                expect(res.data.title).toBe('Study Set');
            }
        });
        it('drops invalid cards but keeps valid ones, reporting droppedCount', () => {
            const payload = {
                title: 'Mixed Flashcards',
                mode: 'flashcards',
                cards: [
                    { question: 'Valid Q1', answer: 'Valid A1' },
                    { question: '', answer: 'Missing question' }, // invalid
                    { question: 'Missing answer', answer: '' }, // invalid
                    { notACard: true }, // invalid
                    { question: 'Valid Q2', answer: 'Valid A2' },
                ],
            };
            const res = validateResult(payload, 'flashcards');
            expect(res.ok).toBe(true);
            if (res.ok && res.data.mode === 'flashcards') {
                expect(res.data.cards).toHaveLength(2);
                expect(res.droppedCount).toBe(3);
                expect(res.data.cards[0].question).toBe('Valid Q1');
                expect(res.data.cards[1].question).toBe('Valid Q2');
            }
        });
        it('fails with VALIDATION_ERROR when zero valid cards exist', () => {
            const payload = {
                title: 'All Invalid Cards',
                mode: 'flashcards',
                cards: [
                    { question: '', answer: '' },
                    { question: '   ', answer: '   ' },
                ],
            };
            const res = validateResult(payload, 'flashcards');
            expect(res.ok).toBe(false);
            if (!res.ok) {
                expect(res.error.code).toBe('VALIDATION_ERROR');
            }
        });
    });
    describe('Quiz Validation', () => {
        it('validates a correct quiz deck and assigns stable IDs', () => {
            const payload = {
                title: 'Operating Systems Quiz',
                mode: 'quiz',
                questions: [
                    {
                        question: 'Which scheduling algorithm can cause starvation?',
                        options: ['Round Robin', 'Shortest Job First (SJF)', 'FIFO', 'FCFS'],
                        correctIndex: 1,
                        explanation: 'SJF can starve longer processes if shorter jobs continually arrive.',
                    },
                ],
            };
            const res = validateResult(payload, 'quiz');
            expect(res.ok).toBe(true);
            if (res.ok && res.data.mode === 'quiz') {
                expect(res.data.title).toBe('Operating Systems Quiz');
                expect(res.data.questions).toHaveLength(1);
                expect(res.data.questions[0].correctIndex).toBe(1);
                expect(res.data.questions[0].options).toHaveLength(4);
                expect(res.droppedCount).toBe(0);
            }
        });
        it('drops quiz questions with invalid correctIndex or insufficient options', () => {
            const payload = {
                title: 'Quiz with bad items',
                mode: 'quiz',
                questions: [
                    {
                        question: 'Valid question',
                        options: ['A', 'B', 'C'],
                        correctIndex: 0,
                    },
                    {
                        question: 'Bad correctIndex out of bounds',
                        options: ['A', 'B'],
                        correctIndex: 5, // invalid
                    },
                    {
                        question: 'Too few options',
                        options: ['Only one option'], // invalid (< 2)
                        correctIndex: 0,
                    },
                ],
            };
            const res = validateResult(payload, 'quiz');
            expect(res.ok).toBe(true);
            if (res.ok && res.data.mode === 'quiz') {
                expect(res.data.questions).toHaveLength(1);
                expect(res.droppedCount).toBe(2);
            }
        });
        it('fails with VALIDATION_ERROR if questions array is missing or empty', () => {
            const payload = {
                title: 'Empty Quiz',
                mode: 'quiz',
                questions: [],
            };
            const res = validateResult(payload, 'quiz');
            expect(res.ok).toBe(false);
            if (!res.ok) {
                expect(res.error.code).toBe('VALIDATION_ERROR');
            }
        });
    });
    describe('Mode Mismatch and Malformed Objects', () => {
        it('fails if non-object is passed', () => {
            const res = validateResult('not-an-object', 'flashcards');
            expect(res.ok).toBe(false);
            if (!res.ok) {
                expect(res.error.code).toBe('VALIDATION_ERROR');
            }
        });
        it('fails if mode does not match requested mode', () => {
            const payload = {
                title: 'Mismatched',
                mode: 'quiz',
                questions: [{ question: 'Q', options: ['A', 'B'], correctIndex: 0 }],
            };
            const res = validateResult(payload, 'flashcards');
            expect(res.ok).toBe(false);
            if (!res.ok) {
                expect(res.error.code).toBe('VALIDATION_ERROR');
                expect(res.error.message).toContain('flashcards');
            }
        });
    });
});
