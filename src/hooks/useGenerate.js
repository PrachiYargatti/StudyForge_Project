import { useReducer, useRef, useCallback, useEffect } from 'react';
import { generateStudySet } from '../lib/api';
import { parseModelOutput } from '../lib/parseModelOutput';
import { validateResult } from '../lib/validateResult';
const initialState = {
    status: 'idle',
    data: null,
    error: null,
    droppedCount: 0,
};
/**
 * Reducer for the request state machine.
 * Enforces mutually exclusive states (idle | loading | success | error),
 * guaranteeing impossible states like loading + error never occur.
 */
function generateReducer(state, action) {
    switch (action.type) {
        case 'START_REQUEST':
            return {
                ...state,
                status: 'loading',
                error: null,
            };
        case 'SUCCESS':
            return {
                status: 'success',
                data: action.payload.data,
                droppedCount: action.payload.droppedCount,
                error: null,
            };
        case 'ERROR':
            return {
                ...state,
                status: 'error',
                error: action.payload.error,
            };
        case 'CANCEL':
            return {
                ...state,
                status: 'idle',
                error: null,
            };
        case 'RESET':
            return initialState;
        case 'LOAD_SAVED':
            return {
                status: 'success',
                data: action.payload.data,
                error: null,
                droppedCount: 0,
            };
        default:
            return state;
    }
}
/**
 * useGenerate
 *
 * Custom hook managing the end-to-end request lifecycle:
 * 1. Concurrency & Stale Response Guard:
 *    Maintains an incrementing `requestIdRef`. If user triggers a second request
 *    before the first finishes, `requestIdRef` increments, the prior request's
 *    AbortController is aborted immediately, and any delayed payload from an older
 *    request is discarded.
 * 2. Client-Side 30s Timeout:
 *    Automatically aborts requests that exceed 30 seconds with a friendly timeout error.
 * 3. Two-Step Client Validation:
 *    raw text -> parseModelOutput (fence removal + JSON.parse) -> validateResult (schema check + drop bad items)
 */
export function useGenerate() {
    const [state, dispatch] = useReducer(generateReducer, initialState);
    // Request counter to guard against stale responses overwriting newer ones
    const requestIdRef = useRef(0);
    // Reference to active AbortController to allow explicit cancellation
    const abortControllerRef = useRef(null);
    // Store last requested parameters to power the "Retry" button
    const lastParamsRef = useRef(null);
    // Cleanup on unmount: abort any in-flight request
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);
    const cancel = useCallback(() => {
        // Abort active network request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        // Increment requestId to invalidate in-flight promises
        requestIdRef.current++;
        dispatch({ type: 'CANCEL' });
    }, []);
    const reset = useCallback(() => {
        cancel();
        dispatch({ type: 'RESET' });
    }, [cancel]);
    const loadSaved = useCallback((deck) => {
        dispatch({ type: 'LOAD_SAVED', payload: { data: deck } });
    }, []);
    const generate = useCallback(async (params) => {
        // Save params for retry capability
        lastParamsRef.current = params;
        // 1. Abort any previous pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        // 2. Create new AbortController and increment request ID
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        const currentRequestId = ++requestIdRef.current;
        dispatch({ type: 'START_REQUEST' });
        // 3. Client-side 30 second timeout
        const timeoutId = setTimeout(() => {
            abortController.abort();
        }, 30000);
        try {
            // Step A: Fetch raw string from Express backend proxy
            const apiResult = await generateStudySet(params, abortController.signal);
            clearTimeout(timeoutId);
            // Stale check: discard if another request started in the meantime
            if (currentRequestId !== requestIdRef.current) {
                return;
            }
            if (!apiResult.ok) {
                dispatch({ type: 'ERROR', payload: { error: apiResult.error } });
                return;
            }
            // Step B: Parse JSON (stripping code fences, trailing prose, etc.)
            const parseResult = parseModelOutput(apiResult.data.raw);
            if (currentRequestId !== requestIdRef.current) {
                return;
            }
            if (!parseResult.ok) {
                dispatch({ type: 'ERROR', payload: { error: parseResult.error } });
                return;
            }
            // Step C: Hand-written schema validation (drop bad items, assign stable IDs)
            const validationResult = validateResult(parseResult.data, params.mode);
            if (currentRequestId !== requestIdRef.current) {
                return;
            }
            if (!validationResult.ok) {
                dispatch({ type: 'ERROR', payload: { error: validationResult.error } });
                return;
            }
            // Step D: Success state
            dispatch({
                type: 'SUCCESS',
                payload: {
                    data: validationResult.data,
                    droppedCount: validationResult.droppedCount,
                },
            });
        }
        catch (err) {
            clearTimeout(timeoutId);
            // If newer request was fired, discard this error
            if (currentRequestId !== requestIdRef.current) {
                return;
            }
            dispatch({
                type: 'ERROR',
                payload: {
                    error: {
                        code: 'UPSTREAM_ERROR',
                        message: 'An unexpected error occurred while processing the AI response.',
                        details: err?.message,
                    },
                },
            });
        }
    }, []);
    const retry = useCallback(() => {
        if (lastParamsRef.current) {
            generate(lastParamsRef.current);
        }
    }, [generate]);
    return {
        ...state,
        generate,
        cancel,
        retry,
        reset,
        loadSaved,
    };
}
