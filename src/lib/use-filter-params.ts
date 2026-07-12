'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { buildQueryString, parseListParam } from './search-params';

const TEXT_DEBOUNCE_MS = 300;

// Client counterpart of the search-params helpers: read/write filter state in the
// URL (replace, no scroll) so every filtered view is linkable and survives refresh.
export function useFilterParams() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    const getParam = useCallback((key: string): string => searchParams.get(key) ?? '', [searchParams]);

    const getListParam = useCallback((key: string): string[] => parseListParam(searchParams.getAll(key)), [searchParams]);

    // Multi-key variant: updates land in ONE router.replace. Two back-to-back
    // setParam calls would race — each snapshots searchParams before the other's
    // replace commits, so the second would clobber the first.
    const setParams = useCallback(
        (updates: Record<string, string | string[] | null>) => {
            const params: Record<string, string | string[] | null> = {};
            searchParams.forEach((existingValue, existingKey) => {
                params[existingKey] = existingValue;
            });
            Object.assign(params, updates);
            router.replace(`${pathname}${buildQueryString(params)}`, { scroll: false });
        },
        [router, pathname, searchParams]
    );

    const setParam = useCallback((key: string, value: string | string[] | null) => setParams({ [key]: value }), [setParams]);

    // For text inputs: debounced so typing doesn't push a history entry per keystroke.
    const setTextParam = useCallback(
        (key: string, value: string) => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => setParam(key, value.length > 0 ? value : null), TEXT_DEBOUNCE_MS);
        },
        [setParam]
    );

    return { getParam, getListParam, setParam, setParams, setTextParam };
}
