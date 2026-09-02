'use client';

import React, { useEffect, useState } from 'react';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from '@/lib/i18n';
import {
  deleteInterviewQuestion,
  listInterviewQuestions,
  type InterviewQuestion,
} from '@/lib/api/tracker';

interface InterviewQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshKey?: number;
}

export function InterviewQuestionsDialog({
  open,
  onOpenChange,
  refreshKey = 0,
}: InterviewQuestionsDialogProps) {
  const { t } = useTranslations();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    listInterviewQuestions()
      .then((items) => {
        if (!cancelled) setQuestions(items);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, refreshKey]);

  const handleDelete = async (questionId: string) => {
    setDeletingId(questionId);
    try {
      await deleteInterviewQuestion(questionId);
      setQuestions((current) => current.filter((item) => item.question_id !== questionId));
    } catch {
      setError(true);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('tracker.interviewQuestions.title')}</DialogTitle>
          <DialogDescription>{t('tracker.interviewQuestions.description')}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-steel-grey" />
          </div>
        ) : error ? (
          <p className="py-6 text-center font-mono text-sm text-destructive">
            {t('tracker.interviewQuestions.loadFailed')}
          </p>
        ) : questions.length === 0 ? (
          <p className="py-6 text-center font-mono text-sm text-steel-grey">
            {t('tracker.interviewQuestions.empty')}
          </p>
        ) : (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            {questions.map((item) => (
              <article key={item.question_id} className="border border-black p-3">
                <div className="font-mono text-xs uppercase text-ink-soft">
                  {item.company || t('tracker.card.companyUnknown')} ·{' '}
                  {item.role || t('tracker.card.roleUnknown')}
                </div>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <p className="whitespace-pre-wrap text-sm text-ink">{item.question}</p>
                  <button
                    type="button"
                    aria-label={t('tracker.interviewQuestions.delete')}
                    title={t('tracker.interviewQuestions.delete')}
                    onClick={() => void handleDelete(item.question_id)}
                    disabled={deletingId === item.question_id}
                    className="shrink-0 border border-black p-1 text-ink hover:text-destructive disabled:opacity-50"
                  >
                    {deletingId === item.question_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
