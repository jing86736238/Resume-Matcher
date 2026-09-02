import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InterviewQuestionsDialog } from '@/components/tracker/interview-questions-dialog';

vi.mock('@/lib/i18n', () => ({
  useTranslations: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/lib/api/tracker', () => ({
  listInterviewQuestions: vi.fn(),
}));

describe('InterviewQuestionsDialog', () => {
  it('loads and displays questions with company and role', async () => {
    const { listInterviewQuestions } = await import('@/lib/api/tracker');
    vi.mocked(listInterviewQuestions).mockResolvedValue([
      {
        question_id: 'q1',
        application_id: 'a1',
        job_id: 'j1',
        question: 'How do you handle incidents?',
        company: 'Acme',
        role: 'Engineer',
        created_at: '2026-01-01T00:00:00Z',
      },
    ]);

    render(<InterviewQuestionsDialog open onOpenChange={vi.fn()} />);

    await waitFor(() =>
      expect(screen.getByText('How do you handle incidents?')).toBeInTheDocument()
    );
    expect(screen.getByText('Acme · Engineer')).toBeInTheDocument();
  });
});
