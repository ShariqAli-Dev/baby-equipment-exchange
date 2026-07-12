import 'server-only';

import type { Timestamp } from 'firebase-admin/firestore';

// Server components can't pass class instances or Firestore Timestamps to
// client components — DTOs are plain serializable objects, timestamps → ISO
// strings (null when absent).
export function toIso(value: unknown): string | null {
    if (value == null) return null;
    const ts = value as Timestamp;
    if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
    return null;
}

// The client-side converters deleted null/undefined keys before writing, so
// stored docs never carry null fields — writes here preserve that shape.
export function omitNullish<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const key in obj) {
        if (obj[key] !== null && obj[key] !== undefined) out[key] = obj[key];
    }
    return out;
}
