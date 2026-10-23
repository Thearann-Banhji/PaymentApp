import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useLanguage } from '../../i18n/LanguageProvider';

const tabIcons = {
  index: { active: 'home', inactive: 'home-outline' },
  invoices: { active: 'document-text', inactive: 'document-text-outline' },
  receipts: { active: 'time', inactive: 'time-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
} as const;

export default function TabLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={({ route }) => {
        const icons = tabIcons[route.name as keyof typeof tabIcons];

        return {
          headerShown: false,
          tabBarActiveTintColor: '#2160e8',
          tabBarInactiveTintColor: '#7b91b7',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 0,
            elevation: 12,
            height: 72,
            paddingTop: 8,
            shadowColor: '#18345f',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? icons?.active : icons?.inactive}
              color={typeof color === 'string' ? color : '#2160e8'}
              size={size + 2}
            />
          ),
        };
      }}
    >
      <Tabs.Screen name="index" options={{ title: t.tabs.home }} />
      <Tabs.Screen name="invoices" options={{ title: t.tabs.invoices }} />
      <Tabs.Screen name="receipts" options={{ title: t.tabs.receipts }} />
      <Tabs.Screen name="profile" options={{ title: t.tabs.profile }} />
    </Tabs>
  );
}
