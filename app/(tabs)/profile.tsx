import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { customer } from '../../constants/invoice';
import { useLanguage } from '../../i18n/LanguageProvider';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const details = [
    { label: t.fields.phone, value: customer.phone, icon: 'call-outline' },
    { label: t.fields.contract, value: customer.contract, icon: 'document-text-outline' },
  ] as const;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <LinearGradient colors={['#f5f9ff', '#edf5ff']} style={styles.background}>
        <ScrollView contentContainerStyle={styles.content}>
          <LanguageSwitcher />
          <Text style={styles.eyebrow}>{t.profile.eyebrow}</Text>
          <Text style={styles.title}>{t.tabs.profile}</Text>
          <Text style={styles.subtitle}>{t.profile.subtitle}</Text>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={31} color="#2160e8" />
            </View>
            <Text style={styles.customerName}>{customer.name}</Text>
            <Text style={styles.customerCaption}>{t.profile.caption}</Text>
          </View>

          <View style={styles.detailsCard}>
            {details.map((detail, index) => (
              <View key={detail.label}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.detailRow}>
                  <Ionicons name={detail.icon} size={21} color="#2160e8" />
                  <View style={styles.detailCopy}>
                    <Text style={styles.label}>{detail.label}</Text>
                    <Text style={styles.value}>{detail.value}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/sign-in')}
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.signOutPressed,
            ]}
          >
            <Ionicons name="log-out-outline" size={20} color="#cf4050" />
            <Text style={styles.signOutText}>{t.profile.signOut}</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#f5f9ff', flex: 1 },
  background: { flex: 1, justifyContent: 'space-between' },
  content: { padding: 22 },
  eyebrow: { color: '#7489ad', fontSize: 11, fontWeight: '700', letterSpacing: 1.1, marginTop: 14 },
  title: { color: '#10284f', fontSize: 28, fontWeight: '700', marginTop: 6 },
  subtitle: { color: '#7489ad', fontSize: 14, lineHeight: 21, marginTop: 7 },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e0eafa',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 24,
    padding: 24,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#e7f0ff',
    borderRadius: 34,
    height: 68,
    justifyContent: 'center',
    width: 68,
  },
  customerName: { color: '#142c54', fontSize: 18, fontWeight: '700', marginTop: 12 },
  customerCaption: { color: '#8295b5', fontSize: 12, marginTop: 5 },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e0eafa',
    borderRadius: 17,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 17,
  },
  divider: { backgroundColor: '#e7edf6', height: 1 },
  detailRow: { alignItems: 'center', flexDirection: 'row', minHeight: 72 },
  detailCopy: { marginLeft: 13 },
  label: { color: '#8295b5', fontSize: 12 },
  value: { color: '#142c54', fontSize: 15, fontWeight: '700', marginTop: 5 },
  footer: {
    backgroundColor: '#f5f9ff',
    borderTopColor: '#e3ebf6',
    borderTopWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  signOutButton: {
    alignItems: 'center',
    backgroundColor: '#fff1f2',
    borderColor: '#f4d7da',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    height: 50,
    justifyContent: 'center',
  },
  signOutPressed: { opacity: 0.78 },
  signOutText: { color: '#c73c4c', fontSize: 14, fontWeight: '700', marginLeft: 9 },
});
