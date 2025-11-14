import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_EVENT_KEY = 'storage-update';

/**
 * A custom React hook to fetch data and keep it synchronized with localStorage updates.
 * It prevents state updates on unmounted components to avoid common React errors.
 *
 * @param fetcher A function that returns a promise resolving to the data.
 * @param watchKeys An array of localStorage keys to watch for changes.
 * @returns An object with the fetched data, loading state, a refetch function, and a boolean indicating if a sync just occurred.
 */
export function useSyncedData<T>(
    fetcher: () => Promise<T>, 
    watchKeys: string[]
): { data: T | null; loading: boolean; refetch: () => void; isSynced: boolean } {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSynced, setIsSynced] = useState(false);
    const [trigger, setTrigger] = useState(0);
    const syncTimeoutRef = useRef<number | null>(null);

    const refetch = useCallback(() => setTrigger(t => t + 1), []);

    const keysDependency = watchKeys.join(',');

    useEffect(() => {
        let isMounted = true;

        const doFetch = async (fromSync = false) => {
            if (!isMounted) return;
            if (data === null) {
                setLoading(true);
            }
            try {
                const result = await fetcher();
                if (isMounted) {
                    setData(result);
                    if (fromSync) {
                        setIsSynced(true);
                        if (syncTimeoutRef.current) {
                            clearTimeout(syncTimeoutRef.current);
                        }
                        syncTimeoutRef.current = window.setTimeout(() => {
                            if (isMounted) setIsSynced(false);
                        }, 2500);
                    }
                }
            } catch (error) {
                 if (isMounted) {
                    console.error("Failed to fetch data in useSyncedData", error);
                 }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        doFetch();

        const handleStorageUpdate = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (watchKeys.includes(detail?.key)) {
                doFetch(true);
            }
        };

        const handleExternalStorageUpdate = (e: StorageEvent) => {
             if (e.key && watchKeys.includes(e.key)) {
                doFetch(true);
            }
        }

        window.addEventListener(STORAGE_EVENT_KEY, handleStorageUpdate);
        window.addEventListener('storage', handleExternalStorageUpdate);

        return () => {
            isMounted = false;
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
            window.removeEventListener(STORAGE_EVENT_KEY, handleStorageUpdate);
            window.removeEventListener('storage', handleExternalStorageUpdate);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keysDependency, trigger]);

    return { data, loading, refetch, isSynced };
}
