import { Alert, Platform } from 'react-native';

import { getAuthErrorMessage } from '@/features/auth/services/auth';

export function notifyAuthError(error: unknown, title = 'Não foi possível concluir'): string {
  const message = getAuthErrorMessage(error);
  if (Platform.OS !== 'web') Alert.alert(title, message);
  return message;
}
