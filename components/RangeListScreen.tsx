import { LinearGradient } from "expo-linear-gradient";
import type { ReactElement } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRangeList } from "../hooks/useRangeList";
import type { DateRange } from "../services/dateRange";
import { ListStatus } from "./ListStatus";
import { RangeFilter } from "./RangeFilter";

type Props<T> = {
  eyebrow: string;
  title: string;
  subtitle: string;
  emptyText: string;
  /** Must be stable (useCallback), or the list refetches every render. */
  fetchItems: (range: DateRange) => Promise<T[]>;
  renderItem: (item: T) => ReactElement;
};

/** Shared layout for the Invoices and Receipts tabs: header, range filter, status and list. */
export function RangeListScreen<T>({
  eyebrow,
  title,
  subtitle,
  emptyText,
  fetchItems,
  renderItem,
}: Props<T>) {
  const { range, selectRange, state, retry } = useRangeList(fetchItems);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <LinearGradient colors={["#f5f9ff", "#edf5ff"]} style={styles.background}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <RangeFilter value={range} onChange={selectRange} />
          <ListStatus state={state} emptyText={emptyText} onRetry={retry} />

          {state.status === "done" && state.items.map(renderItem)}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#f5f9ff", flex: 1 },
  background: { flex: 1 },
  content: { padding: 22 },
  eyebrow: {
    color: "#7489ad",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginTop: 14,
  },
  title: { color: "#10284f", fontSize: 28, fontWeight: "700", marginTop: 6 },
  subtitle: { color: "#7489ad", fontSize: 14, lineHeight: 21, marginTop: 7 },
});
