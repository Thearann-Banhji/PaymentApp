import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import type { RangeListState } from "../hooks/useRangeList";
import { useLanguage } from "../i18n/LanguageProvider";
import { useTheme, useThemedStyles, type AccentColors } from "../theme/ThemeProvider";

type Props = {
  state: RangeListState<unknown>;
  emptyText: string;
  onRetry: () => void;
};

/** Spinner, tap-to-retry error or empty message; renders nothing once items exist. */
export function ListStatus({ state, emptyText, onRetry }: Props) {
  const { colors: c } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useLanguage();

  if (state.status === "loading") {
    return (
      <ActivityIndicator size="large" color={c.primary} style={styles.area} />
    );
  }
  if (state.status === "error") {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={styles.area}
      >
        <Text style={styles.errorText}>{t.list.loadFailed}</Text>
      </Pressable>
    );
  }
  if (state.items.length === 0) {
    return <Text style={[styles.area, styles.emptyText]}>{emptyText}</Text>;
  }
  return null;
}

const createStyles = (c: AccentColors) =>
  StyleSheet.create({
  area: { marginVertical: 32 },
  errorText: { color: "#e1251b", fontSize: 13, textAlign: "center" },
  emptyText: { color: "#7489ad", fontSize: 14, textAlign: "center" },
});
