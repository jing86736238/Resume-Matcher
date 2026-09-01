import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StatusVisibilityDialog } from '@/components/tracker/status-visibility-dialog';
import { APPLICATION_STATUS_ORDER, type ApplicationStatus } from '@/lib/api/tracker';
import {
  DEFAULT_VISIBLE_STATUSES,
  TRACKER_VISIBILITY_STORAGE_KEY,
  readTrackerVisibleStatuses,
  writeTrackerVisibleStatuses,
} from '@/lib/utils/tracker-visibility';

vi.mock('@/lib/i18n', () => ({
  useTranslations: () => ({
    t: (key: string) => key,
  }),
}));

describe('tracker visibility storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to all statuses and restores a saved selection', () => {
    expect(readTrackerVisibleStatuses()).toEqual(DEFAULT_VISIBLE_STATUSES);

    writeTrackerVisibleStatuses(['applied', 'interview']);

    expect(localStorage.getItem(TRACKER_VISIBILITY_STORAGE_KEY)).toBe('["applied","interview"]');
    expect(readTrackerVisibleStatuses()).toEqual(['applied', 'interview']);
  });

  it('allows all statuses to be hidden while rejecting corrupt values', () => {
    writeTrackerVisibleStatuses([]);
    expect(readTrackerVisibleStatuses()).toEqual([]);

    localStorage.setItem(TRACKER_VISIBILITY_STORAGE_KEY, JSON.stringify(['unknown']));
    expect(readTrackerVisibleStatuses()).toEqual(DEFAULT_VISIBLE_STATUSES);

    localStorage.setItem(TRACKER_VISIBILITY_STORAGE_KEY, '{bad json');
    expect(readTrackerVisibleStatuses()).toEqual(DEFAULT_VISIBLE_STATUSES);
  });
});

describe('StatusVisibilityDialog', () => {
  it('renders all status switches and reports toggled visibility', () => {
    const onVisibilityChange = vi.fn();
    const { rerender } = render(
      <StatusVisibilityDialog
        open
        onOpenChange={vi.fn()}
        visibleStatuses={DEFAULT_VISIBLE_STATUSES}
        onVisibilityChange={onVisibilityChange}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByRole('switch')).toHaveLength(APPLICATION_STATUS_ORDER.length);

    fireEvent.click(screen.getAllByRole('switch')[1]);
    expect(onVisibilityChange).toHaveBeenCalledWith(
      APPLICATION_STATUS_ORDER.filter((status) => status !== 'applied')
    );

    const hidden: ApplicationStatus[] = [];
    rerender(
      <StatusVisibilityDialog
        open
        onOpenChange={vi.fn()}
        visibleStatuses={hidden}
        onVisibilityChange={onVisibilityChange}
      />
    );
    expect(
      screen
        .getAllByRole('switch')
        .every((switchElement) => switchElement.getAttribute('aria-checked') === 'false')
    ).toBe(true);
  });
});
