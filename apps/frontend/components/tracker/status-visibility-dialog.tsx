'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { useTranslations } from '@/lib/i18n';
import { APPLICATION_STATUS_ORDER, type ApplicationStatus } from '@/lib/api/tracker';

interface StatusVisibilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visibleStatuses: ApplicationStatus[];
  onVisibilityChange: (statuses: ApplicationStatus[]) => void;
}

export function StatusVisibilityDialog({
  open,
  onOpenChange,
  visibleStatuses,
  onVisibilityChange,
}: StatusVisibilityDialogProps) {
  const { t } = useTranslations();

  const handleToggle = (status: ApplicationStatus, checked: boolean) => {
    const next = checked
      ? [...visibleStatuses, status]
      : visibleStatuses.filter((visibleStatus) => visibleStatus !== status);
    onVisibilityChange(APPLICATION_STATUS_ORDER.filter((item) => next.includes(item)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('tracker.visibility.title')}</DialogTitle>
          <DialogDescription>{t('tracker.visibility.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {APPLICATION_STATUS_ORDER.map((status) => (
            <ToggleSwitch
              key={status}
              checked={visibleStatuses.includes(status)}
              onCheckedChange={(checked) => handleToggle(status, checked)}
              label={t(`tracker.columns.${status}`)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
