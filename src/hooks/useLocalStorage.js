import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage — Persist state to localStorage with cross-component sync.
 *
 * @param {string} key          localStorage key
 * @param {*}      initialValue Fallback if key not found
 * @returns {[any, Function, Function]} [value, setValue, removeValue]
 */
function useLocalStorage(key, initialValue) {
    const readValue = () => {
        try {
            const raw = window.localStorage.getItem(key);
            return raw !== null ? JSON.parse(raw) : initialValue;
        } catch {
            return initialValue;
        }
    };

    const [storedValue, setStoredValue] = useState(readValue);

    const setValue = useCallback(
        (value) => {
            try {
                const next = value instanceof Function ? value(storedValue) : value;
                window.localStorage.setItem(key, JSON.stringify(next));
                setStoredValue(next);
                // Notify other hook instances in the same window
                window.dispatchEvent(new Event('local-storage'));
            } catch {
                console.warn(`[useLocalStorage] Failed to write key "${key}"`);
            }
        },
        [key, storedValue]
    );

    const removeValue = useCallback(() => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
            window.dispatchEvent(new Event('local-storage'));
        } catch {
            console.warn(`[useLocalStorage] Failed to remove key "${key}"`);
        }
    }, [key, initialValue]);

    // Sync when another part of the app writes to the same key
    useEffect(() => {
        const handleStorage = () => setStoredValue(readValue());
        window.addEventListener('storage', handleStorage);
        window.addEventListener('local-storage', handleStorage);
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('local-storage', handleStorage);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
