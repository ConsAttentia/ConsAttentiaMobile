import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ResultReport, ResultSummary } from '@/features/results/services/result-report';

export interface SavedTestResult extends ResultReport {
  id: string;
}

function getStorageKey(userId: string) {
  return `consattentia.test-history.v1:${userId}`;
}

function isSavedTestResult(value: unknown): value is SavedTestResult {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.id === 'string'
    && typeof entry.testName === 'string'
    && typeof entry.userName === 'string'
    && typeof entry.durationSeconds === 'number'
    && typeof entry.attempts === 'number'
    && typeof entry.score === 'number'
    && typeof entry.scoreLabel === 'string'
    && typeof entry.generatedAt === 'string'
    && Array.isArray(entry.details)
    && entry.details.every((detail) => (
      Boolean(detail)
      && typeof detail === 'object'
      && typeof (detail as Record<string, unknown>).label === 'string'
      && typeof (detail as Record<string, unknown>).value === 'string'
    ));
}

export async function readTestHistory(userId: string): Promise<SavedTestResult[]> {
  if (!userId) throw new Error('Entre na sua conta para consultar o histórico.');
  const stored = await AsyncStorage.getItem(getStorageKey(userId));
  if (!stored) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch {
    throw new Error('O histórico salvo está inválido. Os dados não foram alterados.');
  }

  if (!Array.isArray(parsed) || !parsed.every(isSavedTestResult)) {
    throw new Error('O histórico salvo tem um formato inválido. Os dados não foram alterados.');
  }

  return parsed.sort((first, second) => (
    new Date(second.generatedAt).getTime() - new Date(first.generatedAt).getTime()
  ));
}

export async function recordCompletedTest(
  userId: string,
  report: ResultSummary,
  userName: string,
  id: string,
): Promise<void> {
  const history = await readTestHistory(userId);
  const entry: SavedTestResult = {
    ...report,
    id,
    userName,
    generatedAt: new Date().toISOString(),
  };
  const updatedHistory = [entry, ...history.filter((saved) => saved.id !== id)];
  await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(updatedHistory));
}
