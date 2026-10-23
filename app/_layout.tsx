import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from '../i18n/LanguageProvider';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </LanguageProvider>
  );
}
