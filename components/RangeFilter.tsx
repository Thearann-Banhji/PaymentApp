import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "../i18n/LanguageProvider";
import { DATE_RANGES, type DateRange } from "../services/dateRange";
import { useThemedStyles, type AccentColors } from "../theme/ThemeProvider";

type Props = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

export function RangeFilter({ value, onChange }: Props) {
  const styles = useThemedStyles(createStyles);
  const { t } = useLanguage();

  return (
    <View style={styles.filters}>
      {DATE_RANGES.map((range) => {
        const isSelected = range === value;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            key={range}
            onPress={() => onChange(range)}
            style={[styles.filter, isSelected && styles.filterSelected]}
          >
            <Text style={[styles.text, isSelected && styles.textSelected]}>
              {t.filters[range]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (c: AccentColors) =>
  StyleSheet.create({
  filters: { flexDirection: "row", gap: 8, marginTop: 18 },
  filter: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: c.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 9,
  },
  filterSelected: { backgroundColor: c.primaryStrong, borderColor: c.primaryStrong },
  text: { color: c.primary, fontSize: 12, fontWeight: "700" },
  textSelected: { color: "#ffffff" },
});
