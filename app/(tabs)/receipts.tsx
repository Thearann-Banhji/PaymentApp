import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../i18n/LanguageProvider';

export default function ReceiptsScreen() {
  const { t } = useLanguage();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <LinearGradient colors={['#f5f9ff', '#edf5ff']} style={styles.background}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>{t.receipts.eyebrow}</Text>
          <Text style={styles.title}>{t.tabs.receipts}</Text>
          <Text style={styles.subtitle}>{t.receipts.subtitle}</Text>

          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={30} color="#2160e8" />
            </View>
            <Text style={styles.emptyTitle}>{t.receipts.emptyTitle}</Text>
            <Text style={styles.emptyCopy}>{t.receipts.emptyCopy}</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#f5f9ff', flex: 1 },
  background: { flex: 1 },
  content: { padding: 22 },
  eyebrow: { color: '#7489ad', fontSize: 11, fontWeight: '700', letterSpacing: 1.1, marginTop: 14 },
  title: { color: '#10284f', fontSize: 28, fontWeight: '700', marginTop: 6 },
  subtitle: { color: '#7489ad', fontSize: 14, lineHeight: 21, marginTop: 7 },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e0eafa',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 38,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: '#eaf2ff',
    borderRadius: 31,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  emptyTitle: { color: '#142c54', fontSize: 17, fontWeight: '700', marginTop: 18 },
  emptyCopy: { color: '#7489ad', fontSize: 13, lineHeight: 20, marginTop: 8, textAlign: 'center' },
});
