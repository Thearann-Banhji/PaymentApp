import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { InvoiceSummaryCard } from "../../components/home/InvoiceSummaryCard";
import { PaymentSheet } from "../../components/home/PaymentSheet";
import { onPaymentRequest } from "../../hooks/payRequest";
import { useProfileDetails } from "../../hooks/useProfileDetails";
import { useProfilePhoto } from "../../hooks/useProfilePhoto";
import { useUnpaidInvoices } from "../../hooks/useUnpaidInvoices";
import { useLanguage } from "../../i18n/LanguageProvider";
import {
  useTheme,
  useThemedStyles,
  type AccentColors,
} from "../../theme/ThemeProvider";

export default function HomeScreen() {
  const { colors: c } = useTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { t, formatDate, formatRiel } = useLanguage();
  const photo = useProfilePhoto();
  const profile = useProfileDetails();
  const { invoices, loading, error, retry, totalAmount } = useUnpaidInvoices();
  const [selectedReference, setSelectedReference] = useState<string>();
  const [paymentVisible, setPaymentVisible] = useState(false);
  const invoice =
    invoices.find((item) => item.reference === selectedReference) ??
    invoices[0];

  // The center Pay tab button opens the sheet for the selected invoice.
  const hasInvoice = Boolean(invoice);
  useEffect(
    () =>
      onPaymentRequest(() => {
        if (hasInvoice) setPaymentVisible(true);
      }),
    [hasInvoice],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient colors={["#f5f9ff", "#edf5ff"]} style={styles.background}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>{t.home.greeting}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.home.openProfile}
              onPress={() => router.push("/profile")}
              style={styles.headerProfile}
            >
              <Text numberOfLines={1} style={styles.headerName}>
                {profile.name}
              </Text>
              <View style={styles.headerAvatar}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.headerPhoto} />
                ) : (
                  <Ionicons name="person" size={24} color={c.primary} />
                )}
              </View>
            </Pressable>
          </View>

          {!loading && !error && (
            <InvoiceSummaryCard
              count={invoices.length}
              totalAmount={totalAmount}
            />
          )}

          {invoices.length > 0 && (
            <Text style={styles.sectionTitle}>{t.home.selectInvoice}</Text>
          )}

          {loading ? (
            <ActivityIndicator
              size="large"
              color={c.primary}
              style={styles.invoicesStatus}
            />
          ) : error ? (
            <Pressable
              accessibilityRole="button"
              onPress={retry}
              style={styles.invoicesStatus}
            >
              <Text style={styles.invoicesErrorText}>{t.home.loadFailed}</Text>
            </Pressable>
          ) : invoices.length === 0 ? (
            <Text style={[styles.invoicesStatus, styles.invoicesEmptyText]}>
              {t.home.noInvoices}
            </Text>
          ) : null}

          {invoices.map((item) => {
            const isSelected = item.reference === invoice?.reference;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                key={item.reference}
                onPress={() => setSelectedReference(item.reference)}
                style={[
                  styles.invoiceCard,
                  isSelected && styles.invoiceCardSelected,
                ]}
              >
                <View style={styles.invoiceHeader}>
                  <Text style={styles.invoiceHeading}>
                    {t.home.unpaidInvoice}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{t.home.notPaid}</Text>
                  </View>
                </View>

                <View style={styles.invoiceDetails}>
                  <View style={[styles.invoiceColumn, styles.referenceColumn]}>
                    <Text style={styles.invoiceLabel}>
                      {t.fields.reference}
                    </Text>
                    <Text style={styles.invoiceValue}>{item.reference}</Text>
                  </View>
                  <View style={styles.invoiceDivider} />
                  <View style={[styles.invoiceColumn, styles.amountColumn]}>
                    <Text style={styles.invoiceLabel}>{t.fields.amount}</Text>
                    <Text style={styles.amountValue}>
                      {formatRiel(item.amountInRiel)}
                    </Text>
                  </View>
                  <View style={styles.invoiceDivider} />
                  <View style={[styles.invoiceColumn, styles.dateColumn]}>
                    <Text style={styles.invoiceLabel}>{t.fields.date}</Text>
                    <Text style={styles.invoiceValue}>
                      {formatDate(item.date)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </LinearGradient>

      <PaymentSheet
        invoice={invoice}
        visible={paymentVisible}
        onClose={() => setPaymentVisible(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = (c: AccentColors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#f5f9ff" },
    background: { flex: 1 },
    content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 },
    header: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 22,
    },
    title: {
      color: "#10284f",
      fontSize: 18,
      fontWeight: "700",
    },
    headerCopy: { flexShrink: 1, marginRight: 12 },
    headerProfile: {
      alignItems: "center",
      backgroundColor: "#ffffff",
      borderColor: "#e0eafa",
      borderRadius: 26,
      borderWidth: 1,
      flexDirection: "row",
      maxWidth: "55%",
      paddingLeft: 14,
      paddingRight: 4,
      paddingVertical: 4,
    },
    headerName: {
      color: "#142c54",
      flexShrink: 1,
      fontSize: 14,
      fontWeight: "700",
      marginRight: 8,
    },
    headerAvatar: {
      alignItems: "center",
      backgroundColor: c.soft,
      borderRadius: 21,
      height: 42,
      justifyContent: "center",
      overflow: "hidden",
      width: 42,
    },
    headerPhoto: { height: "100%", width: "100%" },
    invoiceCard: {
      backgroundColor: c.soft,
      borderColor: c.border,
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    invoiceCardSelected: { borderColor: c.primaryStrong, borderWidth: 2 },
    invoiceHeader: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 15,
    },
    invoiceHeading: {
      color: c.primary,
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    statusBadge: {
      backgroundColor: "#fff0d7",
      borderRadius: 18,
      paddingHorizontal: 11,
      paddingVertical: 6,
    },
    statusText: { color: "#e77a00", fontSize: 12, fontWeight: "700" },
    invoiceDetails: { alignItems: "stretch", flexDirection: "row" },
    invoiceColumn: { justifyContent: "center", minWidth: 0 },
    referenceColumn: { flex: 1.25 },
    amountColumn: { flex: 1.05, paddingLeft: 14 },
    dateColumn: { flex: 0.9, paddingLeft: 14 },
    invoiceDivider: { backgroundColor: "#d2e2fa", width: 1 },
    invoiceLabel: {
      color: "#7489ad",
      fontSize: 11,
      fontWeight: "500",
      marginBottom: 7,
    },
    invoiceValue: { color: "#142c54", fontSize: 13, fontWeight: "700" },
    amountValue: {
      color: c.primary,
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    sectionTitle: {
      color: "#10284f",
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 12,
    },
    invoicesStatus: { marginVertical: 24 },
    invoicesErrorText: { color: "#e1251b", fontSize: 13, textAlign: "center" },
    invoicesEmptyText: { color: "#7489ad", fontSize: 14, textAlign: "center" },
  });
