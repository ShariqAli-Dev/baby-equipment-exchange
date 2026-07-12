// Isomorphic URL-state helpers: server pages parse `searchParams`, client code
// builds query strings. List params are comma-joined (?status=a,b); parsing also
// accepts repeated params (?status=a&status=b).

export type SearchParamValue = string | string[] | undefined;

export function parseStringParam(value: SearchParamValue): string {
    if (value === undefined) return '';
    return Array.isArray(value) ? (value[0] ?? '') : value;
}

export function parseListParam(value: SearchParamValue): string[] {
    if (value === undefined) return [];
    const values = Array.isArray(value) ? value : [value];
    return values
        .flatMap((entry) => entry.split(','))
        .map((entry) => entry.trim())
        .filter(Boolean);
}

export function buildQueryString(params: Record<string, string | string[] | null | undefined>): string {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined || value.length === 0) continue;
        query.set(key, Array.isArray(value) ? value.join(',') : value);
    }
    const queryString = query.toString();
    return queryString.length > 0 ? `?${queryString}` : '';
}
