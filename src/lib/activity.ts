import AsyncStorage from '@react-native-async-storage/async-storage';

const activityStorageKey = 'consattentia.activity.v1';
const hourCount = 24;
const hourInMilliseconds = 60 * 60 * 1000;

export type ActivityHistory = number[];

function buildHourlyHistory(events: unknown, now = Date.now()): ActivityHistory {
  const currentHour = Math.floor(now / hourInMilliseconds) * hourInMilliseconds;
  const counts = Array(hourCount).fill(0);
  if (!Array.isArray(events)) return counts;

  events.forEach((event) => {
    const timestamp = Number(event);
    const hoursAgo = Math.floor((currentHour - timestamp) / hourInMilliseconds);
    if (Number.isFinite(timestamp) && hoursAgo >= 0 && hoursAgo < hourCount) {
      counts[hourCount - 1 - hoursAgo] += 1;
    }
  });
  return counts;
}

export async function readActivityHistory(): Promise<ActivityHistory> {
  try {
    const stored = await AsyncStorage.getItem(activityStorageKey);
    return buildHourlyHistory(stored ? JSON.parse(stored) : null);
  } catch {
    return Array(hourCount).fill(0);
  }
}

export async function recordActivity(): Promise<ActivityHistory> {
  let events: number[] = [];
  try {
    const stored = await AsyncStorage.getItem(activityStorageKey);
    const parsed: unknown = stored ? JSON.parse(stored) : null;
    events = Array.isArray(parsed)
      ? parsed.map(Number).filter((event) => Number.isFinite(event))
      : [];
    const cutoff = Date.now() - hourCount * hourInMilliseconds;
    events = [...events.filter((event) => event >= cutoff), Date.now()];
    await AsyncStorage.setItem(activityStorageKey, JSON.stringify(events));
  } catch {
    return readActivityHistory();
  }
  return buildHourlyHistory(events);
}
