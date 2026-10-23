import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useLanguage } from '../i18n/LanguageProvider';

export default function SignInScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const { t } = useLanguage();
  const [scanned, setScanned] = useState(false);
  // The camera can emit several scan events before the re-render unmounts it.
  const scanLock = useRef(false);

  const handleCodeScanned = () => {
    if (scanLock.current) return;
    scanLock.current = true;
    setScanned(true);
  };

  const rescan = () => {
    scanLock.current = false;
    setScanned(false);
  };

  const continueWithDemo = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <LinearGradient colors={['#f5f9ff', '#edf5ff']} style={styles.background}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <LanguageSwitcher />
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Ionicons name="receipt" size={26} color="#ffffff" />
            </View>
            <Text style={styles.brandName}>BillFlow</Text>
          </View>

          <Text style={styles.title}>{t.signIn.title}</Text>
          <Text style={styles.subtitle}>{t.signIn.subtitle}</Text>

          <View style={styles.scannerCard}>
            {permission?.granted && !scanned ? (
              <View style={styles.cameraFrame}>
                <CameraView
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={handleCodeScanned}
                  style={StyleSheet.absoluteFill}
                />
                <View pointerEvents="none" style={styles.scanTarget}>
                  <View style={styles.scanLine} />
                </View>
              </View>
            ) : (
              <View style={styles.cameraPlaceholder}>
                <View style={styles.cameraIcon}>
                  <Ionicons
                    name={scanned ? 'qr-code' : 'camera-outline'}
                    size={32}
                    color="#2160e8"
                  />
                </View>
                <Text style={styles.cameraTitle}>
                  {scanned
                    ? t.signIn.detected
                    : permission?.granted
                      ? t.signIn.ready
                      : t.signIn.needCamera}
                </Text>
                <Text style={styles.cameraHint}>
                  {scanned
                    ? t.signIn.detectedMessage
                    : permission?.granted
                      ? t.signIn.pointCamera
                      : t.signIn.allowHint}
                </Text>
                {!permission?.granted && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={requestPermission}
                    style={({ pressed }) => [
                      styles.permissionButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.permissionButtonText}>{t.signIn.allowButton}</Text>
                  </Pressable>
                )}
                {scanned && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={rescan}
                    style={styles.rescanButton}
                  >
                    <Text style={styles.rescanButtonText}>{t.signIn.scanAgain}</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>

          <View style={styles.secureNote}>
            <Ionicons name="shield-checkmark-outline" size={19} color="#7188ad" />
            <Text style={styles.secureNoteText}>{t.signIn.secureNote}</Text>
          </View>

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>{t.signIn.or}</Text>
            <View style={styles.separatorLine} />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={continueWithDemo}
            style={({ pressed }) => [
              styles.demoButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.demoButtonText}>{t.signIn.demoButton}</Text>
            <Ionicons name="arrow-forward" size={19} color="#ffffff" />
          </Pressable>
          <Text style={styles.demoNote}>{t.signIn.demoNote}</Text>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#f5f9ff', flex: 1 },
  background: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 20, paddingTop: 16 },
  brand: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 30, marginTop: 8 },
  brandIcon: {
    alignItems: 'center',
    backgroundColor: '#2863ea',
    borderRadius: 13,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  brandName: { color: '#142c54', fontSize: 22, fontWeight: '800', marginLeft: 11 },
  title: { color: '#10284f', fontSize: 26, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: '#7489ad', fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: 'center' },
  scannerCard: {
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#dfeafa',
    borderRadius: 20,
    borderWidth: 1,
    height: 286,
    marginTop: 26,
    overflow: 'hidden',
    padding: 12,
    width: '100%',
  },
  cameraFrame: { borderRadius: 13, flex: 1, overflow: 'hidden' },
  scanTarget: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
    borderWidth: 2,
    height: 190,
    justifyContent: 'center',
    left: '14%',
    overflow: 'hidden',
    position: 'absolute',
    top: '15%',
    width: '72%',
  },
  scanLine: { backgroundColor: '#63a2ff', height: 2, width: '88%' },
  cameraPlaceholder: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  cameraIcon: {
    alignItems: 'center',
    backgroundColor: '#eaf2ff',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  cameraTitle: { color: '#142c54', fontSize: 16, fontWeight: '700', marginTop: 13 },
  cameraHint: { color: '#7489ad', fontSize: 12, lineHeight: 18, marginTop: 7, textAlign: 'center' },
  permissionButton: {
    backgroundColor: '#2863ea',
    borderRadius: 11,
    marginTop: 15,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  permissionButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  rescanButton: { marginTop: 12, paddingHorizontal: 12, paddingVertical: 8 },
  rescanButtonText: { color: '#2160e8', fontSize: 13, fontWeight: '700' },
  secureNote: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 3,
  },
  secureNoteText: { color: '#7188ad', flex: 1, fontSize: 11, lineHeight: 16, marginLeft: 8 },
  separator: { alignItems: 'center', flexDirection: 'row', marginTop: 21 },
  separatorLine: { backgroundColor: '#dce6f4', flex: 1, height: 1 },
  separatorText: { color: '#8a9ab4', fontSize: 11, fontWeight: '700', marginHorizontal: 13 },
  demoButton: {
    alignItems: 'center',
    backgroundColor: '#2863ea',
    borderRadius: 13,
    flexDirection: 'row',
    height: 54,
    justifyContent: 'center',
    marginTop: 18,
  },
  demoButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700', marginRight: 9 },
  demoNote: { color: '#8292aa', fontSize: 10, lineHeight: 15, marginTop: 10, textAlign: 'center' },
  pressed: { opacity: 0.82 },
});
