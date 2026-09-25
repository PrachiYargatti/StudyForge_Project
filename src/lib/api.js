/**
 * api.ts
 *
 * The ONLY place the frontend communicates with the backend.
 * Calls the Vite dev proxy at /api/generate so the browser never knows
 * or touches backend secrets or the upstream LLM API.
 */
export async function generateStudySet(params, signal) {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (params.mockMode && params.mockMode !== 'none') {
            headers['x-mock-mode'] = params.mockMode;
        }
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers,
            signal,
            body: JSON.stringify(params),
        });
        // Check if request was aborted
        if (signal?.aborted) {
            return {
                ok: false,
                error: {
                    code: 'TIMEOUT',
                    message: 'Request was cancelled.',
                },
            };
        }
        const json = await response.json();
        if (!response.ok) {
            const serverError = json?.error;
            const code = serverError?.code || 'UPSTREAM_ERROR';
            const message = serverError?.message || `Server request failed with status ${response.status}`;
            return {
                ok: false,
                error: {
                    code,
                    message,
                },
            };
        }
        if (!json || typeof json.raw !== 'string') {
            return {
                ok: false,
                error: {
                    code: 'EMPTY_RESPONSE',
                    message: 'The server returned an empty or invalid response.',
                },
            };
        }
        return {
            ok: true,
            data: { raw: json.raw },
        };
    }
    catch (err) {
        if (err.name === 'AbortError' || signal?.aborted) {
            return {
                ok: false,
                error: {
                    code: 'TIMEOUT',
                    message: 'Request was cancelled or timed out after 30 seconds.',
                },
            };
        }
        return {
            ok: false,
            error: {
                code: 'NETWORK_ERROR',
                message: 'Could not connect to the StudyForge server. Please ensure the server is running.',
                details: err?.message,
            },
        };
    }
}
