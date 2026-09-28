export type ResultReport = {
  testName: string;
  userName: string;
  durationSeconds: number;
  attempts: number;
  attemptsLabel?: string;
  score: number;
  scoreLabel: string;
  details: { label: string; value: string }[];
  generatedAt: string;
};

export type ResultSummary = Omit<ResultReport, 'userName' | 'generatedAt'>;

export function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

