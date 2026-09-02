import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApplicationCard } from '@/components/tracker/application-card';
import type { Application } from '@/lib/api/tracker';

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

vi.mock('@/lib/i18n', () => ({
  useTranslations: () => ({ t: (key: string) => key }),
}));

function application(status: Application['status'], interview_at: string | null): Application {
  return {
    application_id: 'app-1',
    job_id: 'job-1',
    resume_id: 'resume-1',
    master_resume_id: null,
    status,
    company: 'Acme',
    role: 'Engineer',
    applied_at: null,
    interview_at,
    notes: null,
    position: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };
}

describe('ApplicationCard interview time', () => {
  it('shows a saved interview time only in the interview column', () => {
    render(
      <ApplicationCard
        application={application('interview', '2026-09-10T14:30:00.000Z')}
        selected={false}
        sharedResume={false}
        onToggleSelect={vi.fn()}
        onOpen={vi.fn()}
      />
    );
    expect(screen.getByText('tracker.card.interviewTime:')).toBeInTheDocument();
  });

  it('does not show interview time for other statuses', () => {
    render(
      <ApplicationCard
        application={application('applied', '2026-09-10T14:30:00.000Z')}
        selected={false}
        sharedResume={false}
        onToggleSelect={vi.fn()}
        onOpen={vi.fn()}
      />
    );
    expect(screen.queryByText('tracker.card.interviewTime:')).not.toBeInTheDocument();
  });
});
