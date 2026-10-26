import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { saveProfileDetails, useProfileDetails } from '../../hooks/useProfileDetails';
import { pickProfilePhoto, removeProfilePhoto, useProfilePhoto } from '../../hooks/useProfilePhoto';
import { useLanguage } from '../../i18n/LanguageProvider';
import {
  THEMES,
  useTheme,
  useThemedStyles,
  type AccentColors,
  type ThemeName,
} from '../../theme/ThemeProvider';

const COUNTRY_CODE = '+855';

/** Local part of a stored number, without the country code or leading 0 (e.g. 99765431). */
function localDigits(phone: string) {
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('855') ? digits.slice(3) : digits;
  return local.replace(/^0+/, '');
}

export default function ProfileScreen() {
  const { colors: c, themeName, setTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { t } = useLanguage();
  const photo = useProfilePhoto();
  const profile = useProfileDetails();
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftPhone, setDraftPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const openEditor = () => {
    setDraftName(profile.name);
    setDraftPhone(localDigits(profile.phone));
    setFormError(null);
    setEditing(true);
  };

  const saveDetails = async () => {
    const name = draftName.trim().replace(/\s+/g, ' ');
    if (!name) return setFormError(t.profile.nameRequired);
    // Cambodian numbers: 8–9 digits after dropping the leading 0 (099765431 -> 99765431).
    const local = localDigits(draftPhone);
    if (local.length < 8 || local.length > 9) return setFormError(t.profile.phoneInvalid);
    try {
      await saveProfileDetails({ name, phone: `${COUNTRY_CODE}${local}` });
      setEditing(false);
    } catch (error) {
      console.error('Unable to save profile.', error);
      setFormError(t.profile.saveFailed);
    }
  };

  const choosePhoto = async () => {
    try {
      const allowed = await pickProfilePhoto();
      if (!allowed) Alert.alert(t.profile.changePhoto, t.profile.photoDenied);
    } catch (error) {
      console.error('Unable to update profile photo.', error);
      Alert.alert(t.profile.changePhoto, t.profile.photoFailed);
    }
  };

  const editPhoto = () => {
    if (!photo) {
      choosePhoto();
      return;
    }
    Alert.alert(t.profile.changePhoto, undefined, [
      { text: t.profile.choosePhoto, onPress: choosePhoto },
      { text: t.profile.removePhoto, style: 'destructive', onPress: removeProfilePhoto },
      { text: t.profile.cancel, style: 'cancel' },
    ]);
  };
  const details = [
    { label: t.fields.phone, value: profile.phone, icon: 'call-outline' },
    { label: t.fields.contract, value: profile.contract, icon: 'document-text-outline' },
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.profile.changePhoto}
              onPress={editPhoto}
              style={({ pressed }) => pressed && styles.avatarPressed}
            >
              <View style={styles.avatar}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={40} color={c.primary} />
                )}
              </View>
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={15} color="#ffffff" />
              </View>
            </Pressable>
            <Text style={styles.customerName}>{profile.name}</Text>
            <Text style={styles.customerCaption}>{t.profile.caption}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={openEditor}
              style={({ pressed }) => [styles.editButton, pressed && styles.avatarPressed]}
            >
              <Ionicons name="create-outline" size={16} color={c.primary} />
              <Text style={styles.editButtonText}>{t.profile.editProfile}</Text>
            </Pressable>
          </View>

          <View style={styles.detailsCard}>
            {details.map((detail, index) => (
              <View key={detail.label}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.detailRow}>
                  <Ionicons name={detail.icon} size={21} color={c.primary} />
                  <View style={styles.detailCopy}>
                    <Text style={styles.label}>{detail.label}</Text>
                    <Text style={styles.value}>{detail.value}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.themeCard}>
            <Text style={styles.label}>{t.profile.themeColor}</Text>
            <View style={styles.swatches}>
              {(Object.keys(THEMES) as ThemeName[]).map((name) => {
                const isSelected = name === themeName;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={t.profile.themes[name]}
                    key={name}
                    onPress={() => setTheme(name)}
                    style={styles.swatchItem}
                  >
                    <View
                      style={[
                        styles.swatchRing,
                        isSelected && { borderColor: THEMES[name].primaryStrong },
                      ]}
                    >
                      <View style={[styles.swatch, { backgroundColor: THEMES[name].primaryStrong }]}>
                        {isSelected && <Ionicons name="checkmark" size={18} color="#ffffff" />}
                      </View>
                    </View>
                    <Text style={[styles.swatchLabel, isSelected && { color: c.primary }]}>
                      {t.profile.themes[name]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
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

      <Modal animationType="fade" onRequestClose={() => setEditing(false)} transparent visible={editing}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.editSheet}>
            <Text style={styles.editTitle}>{t.profile.editProfile}</Text>

            <Text style={styles.inputLabel}>{t.fields.customerName}</Text>
            <TextInput
              autoCapitalize="words"
              autoComplete="name"
              onChangeText={setDraftName}
              returnKeyType="next"
              style={styles.input}
              value={draftName}
            />

            <Text style={styles.inputLabel}>{t.fields.phone}</Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>{COUNTRY_CODE}</Text>
              </View>
              <TextInput
                autoComplete="tel-national"
                keyboardType="number-pad"
                maxLength={10}
                onChangeText={(text) => setDraftPhone(text.replace(/\D/g, ''))}
                onSubmitEditing={saveDetails}
                placeholder="099765431"
                placeholderTextColor="#a5b4ca"
                style={[styles.input, styles.phoneInput]}
                value={draftPhone}
              />
            </View>

            {formError && <Text style={styles.formError}>{formError}</Text>}

            <View style={styles.editActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setEditing(false)}
                style={[styles.actionButton, styles.cancelButton]}
              >
                <Text style={styles.cancelText}>{t.profile.cancel}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={saveDetails}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.saveButton,
                  pressed && styles.avatarPressed,
                ]}
              >
                <Text style={styles.saveText}>{t.profile.save}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (c: AccentColors) =>
  StyleSheet.create({
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
    backgroundColor: c.soft,
    borderRadius: 44,
    height: 88,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 88,
  },
  avatarImage: { height: '100%', width: '100%' },
  avatarPressed: { opacity: 0.8 },
  cameraBadge: {
    alignItems: 'center',
    backgroundColor: c.primaryStrong,
    borderColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 2,
    bottom: 0,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 30,
  },
  customerName: { color: '#142c54', fontSize: 18, fontWeight: '700', marginTop: 12 },
  customerCaption: { color: '#8295b5', fontSize: 12, marginTop: 5 },
  editButton: {
    alignItems: 'center',
    backgroundColor: c.soft,
    borderRadius: 16,
    flexDirection: 'row',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  editButtonText: { color: c.primary, fontSize: 13, fontWeight: '700', marginLeft: 6 },
  modalOverlay: {
    backgroundColor: 'rgba(12, 29, 58, 0.42)',
    flex: 1,
    justifyContent: 'center',
    padding: 22,
  },
  editSheet: { backgroundColor: '#ffffff', borderRadius: 20, padding: 22 },
  editTitle: { color: '#142c54', fontSize: 19, fontWeight: '700', marginBottom: 6 },
  inputLabel: { color: '#8295b5', fontSize: 12, fontWeight: '600', marginTop: 14 },
  input: {
    borderColor: '#dce6f4',
    borderRadius: 12,
    borderWidth: 1,
    color: '#142c54',
    fontSize: 16,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  phoneRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  countryCode: {
    backgroundColor: '#f1f4f9',
    borderColor: '#dce6f4',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  countryCodeText: { color: '#5d7395', fontSize: 16, fontWeight: '700' },
  phoneInput: { flex: 1, marginTop: 0 },
  formError: { color: '#e1251b', fontSize: 12, marginTop: 12 },
  editActions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  actionButton: { alignItems: 'center', borderRadius: 12, flex: 1, paddingVertical: 14 },
  cancelButton: { backgroundColor: '#f1f4f9' },
  cancelText: { color: '#5d7395', fontSize: 15, fontWeight: '700' },
  saveButton: { backgroundColor: c.primaryStrong },
  saveText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  themeCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e0eafa',
    borderRadius: 17,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 17,
    paddingVertical: 15,
  },
  swatches: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  swatchItem: { alignItems: 'center' },
  swatchRing: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 24,
    borderWidth: 2,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  swatch: { alignItems: 'center', borderRadius: 19, height: 38, justifyContent: 'center', width: 38 },
  swatchLabel: { color: '#8295b5', fontSize: 11, fontWeight: '600', marginTop: 5 },
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
