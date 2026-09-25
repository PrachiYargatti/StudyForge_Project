/**
 * Parses raw text output from the LLM into a JavaScript object.
 *
 * Handles:
 * 1. Markdown code fences (```json ... ``` or ``` ... ```)
 * 2. Leading/trailing prose or whitespace around the JSON object
 * 3. Syntax errors with friendly error messages
 *
 * Why this exists:
 * Even with JSON mode enabled, models can occasionally wrap responses
 * in markdown fences or append commentary. This normalizes the output
 * safely before schema validation.
 */
export function parseModelOutput(rawText) {
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
        return {
            ok: false,
            error: {
                code: 'EMPTY_RESPONSE',
                message: 'The AI returned an empty response. Please try again.',
            },
        };
    }
    let cleaned = rawText.trim();
    // 1. Strip markdown code fences if present (e.g. ```json ... ```)
    const fenceRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
    const fenceMatch = cleaned.match(fenceRegex);
    if (fenceMatch && fenceMatch[1]) {
        cleaned = fenceMatch[1].trim();
    }
    // 2. Direct JSON.parse attempt
    try {
        const parsed = JSON.parse(cleaned);
        return { ok: true, data: parsed };
    }
    catch (_initialErr) {
        // 3. Fallback: extract the outermost JSON object if there was extraneous prose
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const extractedJson = cleaned.substring(firstBrace, lastBrace + 1);
            try {
                const parsed = JSON.parse(extractedJson);
                return { ok: true, data: parsed };
            }
            catch (_extractErr) {
                // Fallthrough to parse error return
            }
        }
        return {
            ok: false,
            error: {
                code: 'PARSE_ERROR',
                message: 'The AI returned something unreadable. Please try again.',
                details: 'Failed to parse JSON string from model response.',
            },
        };
    }
}
