import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { invoices } from "../../constants/invoice";
import { useLanguage } from "../../i18n/LanguageProvider";

export default function InvoicesScreen() {
  const { t, formatDate, formatRiel } = useLanguage();

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <LinearGradient colors={["#f5f9ff", "#edf5ff"]} style={styles.background}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>{t.invoices.eyebrow}</Text>
          <Text style={styles.title}>{t.tabs.invoices}</Text>
          <Text style={styles.subtitle}>{t.invoices.subtitle}</Text>

          {invoices.map((invoice) => (
            <View key={invoice.reference} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color="#2160e8"
                  />
                </View>
                <View style={styles.invoiceCopy}>
                  <Text style={styles.reference}>{invoice.reference}</Text>
                  <Text style={styles.date}>
                    {t.invoices.issued(formatDate(invoice.date))}
                  </Text>
                </View>
                <View style={styles.status}>
                  <Text style={styles.statusText}>{t.invoices.unpaid}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>{t.invoices.amountDue}</Text>
                <Text style={styles.amount}>
                  {formatRiel(invoice.amountInRiel)}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#6f89b2"
            />
            <Text style={styles.infoText}>{t.invoices.info}</Text>
          </View>
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
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#e0eafa",
    borderRadius: 17,
    borderWidth: 1,
    marginTop: 14,
    padding: 17,
  },
  cardTop: { alignItems: "center", flexDirection: "row" },
  iconCircle: {
    alignItems: "center",
    backgroundColor: "#eaf2ff",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  invoiceCopy: { flex: 1, marginLeft: 12 },
  reference: { color: "#142c54", fontSize: 15, fontWeight: "700" },
  date: { color: "#8295b5", fontSize: 12, marginTop: 4 },
  status: {
    backgroundColor: "#fff0d7",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: { color: "#e77a00", fontSize: 11, fontWeight: "700" },
  divider: { backgroundColor: "#e7edf6", height: 1, marginVertical: 17 },
  amountRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  amountLabel: { color: "#7489ad", fontSize: 13 },
  amount: { color: "#2160e8", fontSize: 23, fontWeight: "800" },
  infoCard: {
    alignItems: "flex-start",
    backgroundColor: "#eaf3ff",
    borderRadius: 13,
    flexDirection: "row",
    marginTop: 14,
    padding: 14,
  },
  infoText: {
    color: "#62799e",
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 9,
  },
});
