import { useEffect, useRef, useState } from 'react';

import { getUserName } from '@/features/auth/services/auth';
import { auth } from '@/shared/firebase/firebase';
import { recordCompletedTest } from '@/features/results/services/test-history';
import type { ResultSummary } from '@/features/results/services/result-report';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useCompletedTestHistory(report: ResultSummary, completed: boolean) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const historyId = useRef<string | null>(null);
  const lastAttempt = useRef('');

  useEffect(() => {
    if (!completed) {
      historyId.current = null;
      lastAttempt.current = '';
      return;
    }

    const user = auth?.currentUser;
    const currentHistoryId = historyId.current ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    historyId.current = currentHistoryId;
    const currentAttempt = `${currentHistoryId}:${retryCount}`;
    if (lastAttempt.current === currentAttempt) return;
    lastAttempt.current = currentAttempt;

    void (async () => {
      setStatus('saving');
      setError('');
      try {
        if (!user) throw new Error('Entre na sua conta para salvar o histórico do teste.');
        await recordCompletedTest(user.uid, report, getUserName(user), currentHistoryId);
        setStatus('saved');
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar este resultado.');
        setStatus('error');
      }
    })();
  }, [completed, report, retryCount]);

  return {
    status: completed ? status : 'idle',
    error,
    retry: () => setRetryCount((count) => count + 1),
  };
}
