import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../i18n/LanguageProvider';
import { languages, translations } from '../i18n/translations';
import { useThemedStyles, type AccentColors } from '../theme/ThemeProvider';

export function LanguageSwitcher() {
  const styles = useThemedStyles(createStyles);
  const { language, setLanguage, t } = useLanguage();

  return (
    <View accessibilityLabel={t.language} accessibilityRole="radiogroup" style={styles.container}>
      {languages.map((code) => {
        const selected = code === language;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            key={code}
            onPress={() => setLanguage(code)}
            style={[styles.option, selected && styles.optionSelected]}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>
              {translations[code].languageName}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (c: AccentColors) =>
  StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    backgroundColor: '#e4edfb',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 3,
  },
  option: { borderRadius: 9, paddingHorizontal: 12, paddingVertical: 6 },
  optionSelected: { backgroundColor: '#ffffff' },
  text: { color: '#6f84a8', fontSize: 12, fontWeight: '600' },
  textSelected: { color: c.primary },
});
