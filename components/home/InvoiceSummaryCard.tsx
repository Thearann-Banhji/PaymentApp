import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { useLanguage } from "../../i18n/LanguageProvider";
import { useTheme } from "../../theme/ThemeProvider";

type Props = {
  count: number;
  totalAmount: number;
};

/** Headline card: how many invoices are unpaid and how much is owed in total. */
export function InvoiceSummaryCard({ count, totalAmount }: Props) {
  const { colors: c } = useTheme();
  const { t, formatRiel } = useLanguage();

  return (
    <LinearGradient
      colors={[c.primaryStrong, c.primary]}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.card}
    >
      <View style={styles.decoration} />
      <View style={styles.headingRow}>
        <View style={styles.headingIcon}>
          <Ionicons name="wallet-outline" size={18} color="#ffffff" />
        </View>
        <Text style={styles.heading}>{t.home.summaryTitle}</Text>
      </View>

      <Text style={styles.label}>{t.home.totalAmount}</Text>
      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.total}>
        {formatRiel(totalAmount)}
      </Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Ionicons name="document-text-outline" size={18} color="#ffffff" />
          <View style={styles.statCopy}>
            <Text style={styles.statValue}>{count}</Text>
            <Text style={styles.statLabel}>{t.home.totalInvoices}</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Ionicons name="time-outline" size={18} color="#ffffff" />
          <View style={styles.statCopy}>
            <Text style={styles.statValue}>
              {count > 0 ? t.home.notPaid : t.home.allPaid}
            </Text>
            <Text style={styles.statLabel}>{t.home.status}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    elevation: 6,
    marginBottom: 22,
    overflow: "hidden",
    padding: 20,
    shadowColor: "#10284f",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  // Soft circle in the corner for depth.
  decoration: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 90,
    height: 180,
    position: "absolute",
    right: -50,
    top: -70,
    width: 180,
  },
  headingRow: { alignItems: "center", flexDirection: "row" },
  headingIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 10,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  heading: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 10,
  },
  label: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 18 },
  total: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 4,
  },
  stats: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 14,
    flexDirection: "row",
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  stat: { alignItems: "center", flex: 1, flexDirection: "row" },
  statCopy: { marginLeft: 10 },
  statValue: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  statLabel: { color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 2 },
  statDivider: {
    backgroundColor: "rgba(255,255,255,0.25)",
    height: 30,
    marginHorizontal: 12,
    width: 1,
  },
});
