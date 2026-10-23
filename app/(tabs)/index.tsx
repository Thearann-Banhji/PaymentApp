import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { PaymentLogo } from "../../components/PaymentLogo";
import { customer, type Invoice } from "../../constants/invoice";
import { useLanguage } from "../../i18n/LanguageProvider";
import type { Translation } from "../../i18n/translations";
import { getCustomerInvoices } from "../../services/invoices";
import { generateKhqr, type KhqrResult } from "../../services/khqr";

const INSTITUTE_ID = "inst-28378586";

type PaymentMethod = "aba" | "khqr";
type PaymentStep = "methods" | "aba" | "khqr";

const paymentMethods = [
  { id: "aba", label: "abaLabel", subtitle: "abaSubtitle" },
  { id: "khqr", label: "khqrLabel", subtitle: "khqrSubtitle" },
] as const satisfies readonly {
  id: PaymentMethod;
  label: keyof Translation["payment"];
  subtitle: keyof Translation["payment"];
}[];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, formatDate, formatRiel } = useLanguage();
  const p = t.payment;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoicesError, setInvoicesError] = useState(false);
  const [selectedReference, setSelectedReference] = useState<string>();
  const invoice =
    invoices.find((item) => item.reference === selectedReference) ??
    invoices[0];
  const amount = invoice ? formatRiel(invoice.amountInRiel) : "";
  const demoQrValue = invoice
    ? `BILLFLOW-DEMO|${invoice.reference}|KHR|${invoice.amountInRiel}`
    : "";

  const fetchInvoices = useCallback(
    () =>
      getCustomerInvoices(INSTITUTE_ID, customer.id)
        .then(setInvoices)
        .catch((error) => {
          console.error("Unable to load invoices.", error);
          setInvoicesError(true);
        })
        .finally(() => setInvoicesLoading(false)),
    [],
  );

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const loadInvoices = () => {
    setInvoicesLoading(true);
    setInvoicesError(false);
    fetchInvoices();
  };
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("khqr");
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("methods");
  const [khqr, setKhqr] = useState<KhqrResult | null>(null);
  const [khqrLoading, setKhqrLoading] = useState(false);
  const [khqrError, setKhqrError] = useState<string | null>(null);

  const loadKhqr = async () => {
    if (!invoice) return;
    setKhqr(null);
    setKhqrError(null);
    setKhqrLoading(true);
    try {
      setKhqr(await generateKhqr(INSTITUTE_ID, invoice.amountInRiel, invoice.code));
    } catch (error) {
      console.error("Unable to generate KHQR.", error);
      setKhqrError(error instanceof Error ? error.message : String(error));
    } finally {
      setKhqrLoading(false);
    }
  };

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await Clipboard.setStringAsync(value);
      Alert.alert(t.copy.copied, t.copy.copiedMessage(label));
    } catch (error) {
      console.error("Unable to copy to clipboard.", error);
      Alert.alert(t.copy.failed, t.copy.retry);
    }
  };

  const closePayment = () => {
    setPaymentVisible(false);
    setPaymentStep("methods");
  };

  const payWithAba = async () => {
    if (!invoice) return;
    setKhqrError(null);
    setKhqrLoading(true);
    try {
      const result = await generateKhqr(INSTITUTE_ID, invoice.amountInRiel, invoice.code);
      if (!result.deeplink) throw new Error(p.openAbaFailed);
      await Linking.openURL(result.deeplink);
    } catch (error) {
      console.error("Unable to open ABA Mobile.", error);
      setKhqrError(error instanceof Error ? error.message : p.openAbaFailed);
    } finally {
      setKhqrLoading(false);
    }
  };

  const continueToPayment = () => {
    setPaymentStep(selectedMethod);
    if (selectedMethod === "khqr") loadKhqr();
    else payWithAba();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient colors={["#f5f9ff", "#edf5ff"]} style={styles.background}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{t.home.greeting}</Text>
              <Text style={styles.title}>{t.home.title}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.home.openProfile}
              onPress={() => router.push("/profile")}
              style={styles.headerAvatar}
            >
              <Ionicons name="person" size={27} color="#2160e8" />
            </Pressable>
          </View>

          <View style={styles.customerCard}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.home.openProfile}
              onPress={() => router.push("/profile")}
              style={styles.customerNameRow}
            >
              <View style={styles.avatar}>
                <Ionicons name="person" size={28} color="#2160e8" />
              </View>
              <View style={styles.customerNameCopy}>
                <Text style={styles.fieldLabel}>{t.fields.customerName}</Text>
                <Text style={styles.customerName}>{customer.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={23} color="#7b91b7" />
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={23} color="#2160e8" />
              <View style={styles.detailCopy}>
                <Text style={styles.fieldLabel}>{t.fields.phone}</Text>
                <Text style={styles.detailValue}>{customer.phone}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.copy.copyLabel(t.fields.phone)}
                hitSlop={12}
                onPress={() => copyToClipboard(customer.phone, t.fields.phone)}
              >
                <Ionicons name="copy-outline" size={21} color="#7b91b7" />
              </Pressable>
            </View>

            <View style={styles.dividerIndented} />

            <View style={styles.detailRow}>
              <Ionicons
                name="document-text-outline"
                size={23}
                color="#2160e8"
              />
              <View style={styles.detailCopy}>
                <Text style={styles.fieldLabel}>{t.fields.contract}</Text>
                <Text style={styles.detailValue}>{customer.contract}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.copy.copyLabel(t.fields.contract)}
                hitSlop={12}
                onPress={() =>
                  copyToClipboard(customer.contract, t.fields.contract)
                }
              >
                <Ionicons name="copy-outline" size={21} color="#7b91b7" />
              </Pressable>
            </View>
          </View>

          {invoicesLoading ? (
            <ActivityIndicator
              size="large"
              color="#2160e8"
              style={styles.invoicesStatus}
            />
          ) : invoicesError ? (
            <Pressable
              accessibilityRole="button"
              onPress={loadInvoices}
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

          <Pressable
            accessibilityRole="button"
            disabled={!invoice}
            onPress={() => {
              setPaymentStep("methods");
              setPaymentVisible(true);
            }}
            style={({ pressed }) => [
              styles.payButton,
              styles.payButtonSpacing,
              !invoice && styles.payButtonDisabled,
              pressed && styles.payButtonPressed,
            ]}
          >
            <Ionicons name="card-outline" size={27} color="#ffffff" />
            <Text style={styles.payButtonText}>{t.home.payNow}</Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>

      <Modal
        animationType="slide"
        onRequestClose={closePayment}
        transparent
        visible={paymentVisible}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel={p.closeOptions}
            onPress={closePayment}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              styles.paymentSheet,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeadingRow}>
              <View style={styles.sheetTitleArea}>
                {paymentStep !== "methods" && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={p.back}
                    hitSlop={10}
                    onPress={() => setPaymentStep("methods")}
                    style={styles.backButton}
                  >
                    <Ionicons name="arrow-back" size={20} color="#2160e8" />
                  </Pressable>
                )}
                <View>
                  <Text style={styles.sheetTitle}>
                    {paymentStep === "methods"
                      ? p.chooseTitle
                      : paymentStep === "aba"
                        ? p.abaTitle
                        : p.khqrTitle}
                  </Text>
                  <Text style={styles.sheetSubtitle}>
                    {invoice?.reference} · {amount}
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={p.close}
                hitSlop={12}
                onPress={closePayment}
              >
                <Ionicons name="close-circle" size={27} color="#a5b4ca" />
              </Pressable>
            </View>

            {paymentStep === "methods" ? (
              <>
                {paymentMethods.map((method) => {
                  const isSelected = selectedMethod === method.id;
                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      key={method.id}
                      onPress={() => setSelectedMethod(method.id)}
                      style={[
                        styles.paymentMethod,
                        isSelected && styles.paymentMethodSelected,
                      ]}
                    >
                      <PaymentLogo provider={method.id} />
                      <View style={styles.methodCopy}>
                        <Text style={styles.paymentMethodLabel}>
                          {p[method.label]}
                        </Text>
                        <Text style={styles.methodSubtitle}>
                          {p[method.subtitle]}
                        </Text>
                      </View>
                      <Ionicons
                        name={
                          isSelected ? "radio-button-on" : "radio-button-off"
                        }
                        size={21}
                        color={isSelected ? "#2160e8" : "#a5b4ca"}
                      />
                    </Pressable>
                  );
                })}
                <Pressable
                  accessibilityRole="button"
                  onPress={continueToPayment}
                  style={({ pressed }) => [
                    styles.confirmButton,
                    pressed && styles.payButtonPressed,
                  ]}
                >
                  <Text style={styles.confirmButtonText}>
                    {selectedMethod === "khqr" ? p.generateKhqr : p.continueAba}
                  </Text>
                </Pressable>
                <Text style={styles.demoNote}>{p.demoNote}</Text>
              </>
            ) : paymentStep === "aba" ? (
              <View style={styles.providerPanel}>
                <View style={styles.providerIcon}>
                  <PaymentLogo provider="aba" size={64} />
                </View>
                <Text style={styles.providerTitle}>{p.abaPanelTitle}</Text>
                <Text style={styles.providerDescription}>
                  {p.abaPanelDescription}
                </Text>
                {khqrLoading ? (
                  <ActivityIndicator
                    size="large"
                    color="#2160e8"
                    style={styles.providerButton}
                  />
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    onPress={payWithAba}
                    style={({ pressed }) => [
                      styles.confirmButton,
                      styles.providerButton,
                      pressed && styles.payButtonPressed,
                    ]}
                  >
                    <Text style={styles.confirmButtonText}>{p.openAba}</Text>
                  </Pressable>
                )}
                {khqrError && !khqrLoading && (
                  <Text style={styles.qrErrorText}>{khqrError}</Text>
                )}
              </View>
            ) : (
              <View style={styles.qrPanel}>
                <View style={styles.qrFrame}>
                  {khqrLoading ? (
                    <View style={styles.qrPlaceholder}>
                      <ActivityIndicator size="large" color="#2160e8" />
                    </View>
                  ) : khqrError ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={loadKhqr}
                      style={styles.qrPlaceholder}
                    >
                      <Ionicons name="refresh" size={32} color="#e1251b" />
                      <Text style={styles.qrErrorText}>{khqrError}</Text>
                    </Pressable>
                  ) : khqr?.image ? (
                    <Image
                      source={{ uri: khqr.image }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <QRCode
                      value={khqr?.qrString ?? demoQrValue}
                      size={196}
                      color="#142c54"
                      backgroundColor="#ffffff"
                    />
                  )}
                </View>
                <Text style={styles.qrAmount}>{amount}</Text>
                {khqr?.deeplink && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      Linking.openURL(khqr.deeplink!).catch(() =>
                        Alert.alert(p.abaTitle, p.openAbaFailed),
                      )
                    }
                    style={({ pressed }) => [
                      styles.confirmButton,
                      styles.providerButton,
                      pressed && styles.payButtonPressed,
                    ]}
                  >
                    <Text style={styles.confirmButtonText}>{p.openAba}</Text>
                  </Pressable>
                )}
                <Text style={styles.providerDescription}>
                  {p.qrDescription}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    copyToClipboard(
                      invoice?.reference ?? "",
                      t.fields.invoiceReference,
                    )
                  }
                  style={styles.copyReferenceButton}
                >
                  <Ionicons name="copy-outline" size={17} color="#2160e8" />
                  <Text style={styles.copyReferenceText}>
                    {p.copyReference}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f9ff" },
  background: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  greeting: {
    color: "#7489ad",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  title: {
    color: "#10284f",
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  headerAvatar: {
    alignItems: "center",
    backgroundColor: "#e1edff",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  customerCard: {
    backgroundColor: "#ffffff",
    borderColor: "#e0eafa",
    borderRadius: 18,
    borderWidth: 1,
    elevation: 3,
    marginBottom: 18,
    paddingHorizontal: 17,
    paddingVertical: 13,
    shadowColor: "#7394c4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  customerNameRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 66,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#e7f0ff",
    borderRadius: 29,
    height: 58,
    justifyContent: "center",
    marginRight: 16,
    width: 58,
  },
  customerNameCopy: { flex: 1 },
  fieldLabel: {
    color: "#7489ad",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.35,
    textTransform: "uppercase",
  },
  customerName: {
    color: "#142c54",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 5,
  },
  divider: { backgroundColor: "#e5edf8", height: 1, marginVertical: 10 },
  dividerIndented: {
    backgroundColor: "#e5edf8",
    height: 1,
    marginLeft: 39,
    marginVertical: 10,
  },
  detailRow: { alignItems: "center", flexDirection: "row", minHeight: 48 },
  detailCopy: { flex: 1, marginLeft: 14 },
  detailValue: {
    color: "#142c54",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  invoiceCard: {
    backgroundColor: "#eaf3ff",
    borderColor: "#d5e5ff",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  invoiceCardSelected: { borderColor: "#2863ea", borderWidth: 2 },
  invoiceHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  invoiceHeading: {
    color: "#2160e8",
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
    color: "#2160e8",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  payButton: {
    alignItems: "center",
    backgroundColor: "#2863ea",
    borderRadius: 14,
    flexDirection: "row",
    height: 60,
    justifyContent: "center",
  },
  payButtonSpacing: { marginTop: 6 },
  payButtonDisabled: { opacity: 0.5 },
  invoicesStatus: { marginVertical: 24 },
  invoicesErrorText: { color: "#e1251b", fontSize: 13, textAlign: "center" },
  invoicesEmptyText: { color: "#7489ad", fontSize: 14, textAlign: "center" },
  payButtonPressed: { opacity: 0.82 },
  payButtonText: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "700",
    marginLeft: 12,
  },
  modalOverlay: {
    backgroundColor: "rgba(12, 29, 58, 0.42)",
    flex: 1,
    justifyContent: "flex-end",
  },
  paymentSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "#dbe4f0",
    borderRadius: 3,
    height: 5,
    marginBottom: 20,
    width: 42,
  },
  sheetHeadingRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sheetTitleArea: { alignItems: "center", flex: 1, flexDirection: "row" },
  backButton: { marginRight: 12, paddingVertical: 5 },
  sheetTitle: { color: "#142c54", fontSize: 20, fontWeight: "700" },
  sheetSubtitle: { color: "#7489ad", fontSize: 13, marginTop: 5 },
  paymentMethod: {
    alignItems: "center",
    borderColor: "#e5edf8",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 15,
  },
  paymentMethodSelected: { backgroundColor: "#f2f7ff", borderColor: "#7da5f7" },
  methodCopy: { flex: 1, marginLeft: 12 },
  paymentMethodLabel: { color: "#142c54", fontSize: 14, fontWeight: "600" },
  methodSubtitle: { color: "#8295b5", fontSize: 11, marginTop: 3 },
  confirmButton: {
    alignItems: "center",
    backgroundColor: "#2863ea",
    borderRadius: 13,
    height: 54,
    justifyContent: "center",
    marginTop: 7,
  },
  confirmButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  demoNote: {
    color: "#8091aa",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 12,
    textAlign: "center",
  },
  providerPanel: { alignItems: "center", paddingTop: 4 },
  providerIcon: { marginBottom: 14 },
  providerTitle: { color: "#142c54", fontSize: 17, fontWeight: "700" },
  providerDescription: {
    color: "#7489ad",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    textAlign: "center",
  },
  providerButton: { alignSelf: "stretch", marginTop: 18 },
  demoWarning: {
    color: "#bd7623",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 11,
    textAlign: "center",
  },
  qrPanel: { alignItems: "center", paddingTop: 2 },
  demoBadge: {
    backgroundColor: "#fff0d7",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  demoBadgeText: {
    color: "#b86a13",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.45,
  },
  qrFrame: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e5edf8",
    borderRadius: 17,
    borderWidth: 1,
    marginTop: 16,
    padding: 15,
  },
  qrPlaceholder: {
    alignItems: "center",
    height: 196,
    justifyContent: "center",
    width: 196,
  },
  qrImage: { height: 288, width: 196 },
  qrErrorText: {
    color: "#e1251b",
    fontSize: 11,
    marginTop: 8,
    textAlign: "center",
  },
  qrAmount: {
    color: "#2160e8",
    fontSize: 23,
    fontWeight: "800",
    marginTop: 15,
  },
  copyReferenceButton: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 14,
    padding: 8,
  },
  copyReferenceText: {
    color: "#2160e8",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 7,
  },
});
