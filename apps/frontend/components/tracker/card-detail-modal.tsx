'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Pencil from 'lucide-react/dist/esm/icons/pencil';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/lib/i18n';
import {
  createInterviewQuestion,
  getApplicationDetail,
  updateApplication,
  type ApplicationDetail,
} from '@/lib/api/tracker';

function toDateTimeLocal(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function toIsoString(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

interface CardDetailModalProps {
  applicationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function CardDetailModal({
  applicationId,
  open,
  onOpenChange,
  onUpdated,
}: CardDetailModalProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [interviewAt, setInterviewAt] = useState('');
  const [savingInterviewAt, setSavingInterviewAt] = useState(false);
  const [interviewAtError, setInterviewAtError] = useState<string | null>(null);
  const [interviewQuestion, setInterviewQuestion] = useState('');
  const [savingInterviewQuestion, setSavingInterviewQuestion] = useState(false);
  const [interviewQuestionError, setInterviewQuestionError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !applicationId) {
      setDetail(null);
      setInterviewQuestion('');
      setInterviewQuestionError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getApplicationDetail(applicationId)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        setNotes(data.notes ?? '');
        setInterviewAt(toDateTimeLocal(data.interview_at));
        setNotesError(null);
        setInterviewQuestion('');
        setInterviewQuestionError(null);
        setInterviewAtError(null);
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, applicationId]);

  // Keep textarea Enter from bubbling to dialog/global handlers.
  const handleNotesKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') e.stopPropagation();
  };

  const handleSaveNotes = async () => {
    if (!applicationId) return;
    setSavingNotes(true);
    setNotesError(null);
    try {
      await updateApplication(applicationId, { notes });
      onUpdated();
    } catch {
      // Show a generic message — never echo raw backend error text inline,
      // which could contain sensitive values.
      setNotesError(t('common.error'));
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSaveInterviewAt = async () => {
    if (!applicationId) return;
    setSavingInterviewAt(true);
    setInterviewAtError(null);
    try {
      await updateApplication(applicationId, { interview_at: toIsoString(interviewAt) });
      onUpdated();
    } catch {
      setInterviewAtError(t('common.error'));
    } finally {
      setSavingInterviewAt(false);
    }
  };

  const handleSaveInterviewQuestion = async () => {
    if (!applicationId || !interviewQuestion.trim()) return;
    setSavingInterviewQuestion(true);
    setInterviewQuestionError(null);
    try {
      await createInterviewQuestion(applicationId, interviewQuestion.trim());
      setInterviewQuestion('');
      onUpdated();
    } catch {
      setInterviewQuestionError(t('tracker.interviewQuestions.saveFailed'));
    } finally {
      setSavingInterviewQuestion(false);
    }
  };

  const resumeAvailable = Boolean(detail?.resume);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{detail?.company || t('tracker.card.companyUnknown')}</DialogTitle>
          <DialogDescription>{detail?.role || t('tracker.card.roleUnknown')}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-steel-grey" />
          </div>
        ) : detail ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs uppercase text-ink-soft">
              <span className="border border-black bg-paper-tint px-2 py-0.5">
                {t(`tracker.columns.${detail.status}`)}
              </span>
              {detail.applied_at && (
                <span>
                  {new Date(detail.applied_at).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <Label>{t('tracker.modal.jobDescription')}</Label>
              <div className="max-h-48 overflow-y-auto whitespace-pre-wrap border border-black bg-background p-3 text-sm">
                {detail.job_content || t('tracker.modal.noJobDescription')}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="card-notes">{t('tracker.modal.notes')}</Label>
              <Textarea
                id="card-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onKeyDown={handleNotesKeyDown}
                placeholder={t('tracker.modal.notesPlaceholder')}
                rows={3}
              />
              <div className="flex items-center justify-end gap-3">
                {notesError && (
                  <span className="font-mono text-xs text-destructive">{notesError}</span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                >
                  {savingNotes ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('tracker.modal.saveNotes')
                  )}
                </Button>
              </div>
            </div>

            {detail.status === 'interview' && (
              <div className="space-y-1">
                <Label htmlFor="card-interview-at">{t('tracker.modal.interviewTime')}</Label>
                <input
                  id="card-interview-at"
                  type="datetime-local"
                  value={interviewAt}
                  onChange={(e) => setInterviewAt(e.target.value)}
                  aria-label={t('tracker.modal.interviewTime')}
                  className="flex h-10 w-full border border-black bg-background px-3 py-2 font-mono text-sm text-ink outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex items-center justify-end gap-3">
                  {interviewAtError && (
                    <span className="font-mono text-xs text-destructive">{interviewAtError}</span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveInterviewAt}
                    disabled={savingInterviewAt}
                  >
                    {savingInterviewAt ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t('tracker.modal.saveInterviewTime')
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="interview-question">{t('tracker.interviewQuestions.addLabel')}</Label>
              <Textarea
                id="interview-question"
                value={interviewQuestion}
                onChange={(e) => setInterviewQuestion(e.target.value)}
                onKeyDown={handleNotesKeyDown}
                placeholder={t('tracker.interviewQuestions.placeholder')}
                rows={3}
              />
              <div className="flex items-center justify-end gap-3">
                {interviewQuestionError && (
                  <span className="font-mono text-xs text-destructive">
                    {interviewQuestionError}
                  </span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveInterviewQuestion}
                  disabled={savingInterviewQuestion || !interviewQuestion.trim()}
                >
                  {savingInterviewQuestion ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('tracker.interviewQuestions.save')
                  )}
                </Button>
              </div>
            </div>

            {!resumeAvailable && (
              <p className="font-mono text-xs text-warning">
                {t('tracker.modal.resumeUnavailable')}
              </p>
            )}
          </div>
        ) : (
          <p className="py-6 text-center font-mono text-sm text-steel-grey">
            {t('tracker.modal.loadFailed')}
          </p>
        )}

        <DialogFooter>
          <Button
            onClick={() => {
              if (detail?.resume_id) router.push(`/builder?id=${detail.resume_id}`);
            }}
            disabled={!resumeAvailable}
          >
            <Pencil className="h-4 w-4" />
            {t('tracker.modal.editResume')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
