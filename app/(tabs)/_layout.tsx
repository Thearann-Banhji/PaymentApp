import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { requestPayment } from '../../hooks/payRequest';
import { useLanguage } from '../../i18n/LanguageProvider';
import { useTheme, useThemedStyles, type AccentColors } from '../../theme/ThemeProvider';

const tabIcons = {
  index: { active: 'home', inactive: 'home-outline' },
  invoices: { active: 'document-text', inactive: 'document-text-outline' },
  receipts: { active: 'time', inactive: 'time-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
} as const;

export default function TabLayout() {
  const { colors: c } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  // Keep the bar above the home indicator / Android navigation bar.
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={({ route }) => {
        const icons = tabIcons[route.name as keyof typeof tabIcons];

        return {
          headerShown: false,
          tabBarActiveTintColor: c.primary,
          tabBarInactiveTintColor: '#7b91b7',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 0,
            elevation: 12,
            height: 60 + bottomInset,
            paddingBottom: bottomInset,
            paddingTop: 6,
            shadowColor: '#18345f',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? icons?.active : icons?.inactive}
              color={typeof color === 'string' ? color : c.primary}
              size={size + 2}
            />
          ),
        };
      }}
    >
      <Tabs.Screen name="index" options={{ title: t.tabs.home }} />
      <Tabs.Screen name="invoices" options={{ title: t.tabs.invoices }} />
      <Tabs.Screen
        name="pay"
        options={{
          title: t.tabs.pay,
          tabBarButton: () => (
            <View style={styles.payTab}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.tabs.pay}
                onPress={() => {
                  // The payment sheet lives on Home, which stays mounted as the first tab.
                  router.navigate('/');
                  requestPayment();
                }}
                style={({ pressed }) => [styles.payButton, pressed && styles.payButtonPressed]}
              >
                <Ionicons name="card" size={28} color="#ffffff" />
              </Pressable>
            </View>
          ),
        }}
      />
      <Tabs.Screen name="receipts" options={{ title: t.tabs.receipts }} />
      <Tabs.Screen name="profile" options={{ title: t.tabs.profile }} />
    </Tabs>
  );
}

const createStyles = (c: AccentColors) =>
  StyleSheet.create({
  payTab: { alignItems: 'center', flex: 1 },
  payButton: {
    alignItems: 'center',
    backgroundColor: c.primaryStrong,
    borderRadius: 20,
    elevation: 8,
    height: 60,
    justifyContent: 'center',
    marginTop: -24,
    shadowColor: c.primaryStrong,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    width: 60,
  },
  payButtonPressed: { opacity: 0.85, transform: [{ scale: 0.96 }] },
});
