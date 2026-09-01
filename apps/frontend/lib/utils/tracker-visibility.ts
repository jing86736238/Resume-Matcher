import { safeStorage } from './resume-draft-storage';
import { APPLICATION_STATUS_ORDER, type ApplicationStatus } from '@/lib/api/tracker';

export const TRACKER_VISIBILITY_STORAGE_KEY = 'resume_matcher_tracker_visible_statuses';

export const DEFAULT_VISIBLE_STATUSES: ApplicationStatus[] = [...APPLICATION_STATUS_ORDER];

/**
 * Read the user's tracker column visibility without allowing malformed or
 * hand-edited localStorage data to affect the board.
 */
export function readTrackerVisibleStatuses(): ApplicationStatus[] {
  const stored = safeStorage.get(TRACKER_VISIBILITY_STORAGE_KEY);
  if (stored === null) return [...DEFAULT_VISIBLE_STATUSES];

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [...DEFAULT_VISIBLE_STATUSES];

    // An empty array is intentional (all columns hidden). If a non-empty
    // value contains no known statuses, treat it as corrupt and reset safely.
    const visible = APPLICATION_STATUS_ORDER.filter((status) => parsed.includes(status));
    if (parsed.length > 0 && visible.length === 0) return [...DEFAULT_VISIBLE_STATUSES];
    return visible;
  } catch {
    return [...DEFAULT_VISIBLE_STATUSES];
  }
}

export function writeTrackerVisibleStatuses(statuses: ApplicationStatus[]): void {
  const normalized = APPLICATION_STATUS_ORDER.filter((status) => statuses.includes(status));
  safeStorage.set(TRACKER_VISIBILITY_STORAGE_KEY, JSON.stringify(normalized));
}
