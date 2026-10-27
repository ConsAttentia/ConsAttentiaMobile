import { AccessibilitySettings } from '@/features/accessibility/components/accessibility-settings';
import { UtilityPage } from '@/features/dashboard/components/utility-page';

export default function SettingsScreen() {
  return (
    <UtilityPage
      eyebrow="PREFERÊNCIAS DA CONTA"
      title="Configurações"
      description="Ajuste a experiência do aplicativo para você.">
      <AccessibilitySettings />
    </UtilityPage>
  );
}