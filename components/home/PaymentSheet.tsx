import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PaymentLogo } from "../PaymentLogo";
import type { Invoice } from "../../constants/invoice";
import { useProfileDetails } from "../../hooks/useProfileDetails";
import { useLanguage } from "../../i18n/LanguageProvider";
import type { Translation } from "../../i18n/translations";
import {
  generateKhqr,
  type KhqrResult,
  type PaymentInvoice,
} from "../../services/khqr";
import {
  useTheme,
  useThemedStyles,
  type AccentColors,
} from "../../theme/ThemeProvider";

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

function toPaymentInvoice(invoice: Invoice, customerId: string): PaymentInvoice {
  return {
    transactionId: invoice.id,
    invoiceNo: invoice.reference,
    tranId: invoice.code,
    customerId,
    amount: invoice.amountInRiel,
  };
}

type Props = {
  invoice: Invoice | undefined;
  visible: boolean;
  onClose: () => void;
};

/** Bottom sheet for paying one invoice: choose ABA or KHQR, then pay. */
export function PaymentSheet({ invoice, visible, onClose }: Props) {
  const { colors: c } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const { t, formatRiel } = useLanguage();
  const p = t.payment;
  const profile = useProfileDetails();
  const amount = invoice ? formatRiel(invoice.amountInRiel) : "";
  const demoQrValue = invoice
    ? `BILLFLOW-DEMO|${invoice.reference}|KHR|${invoice.amountInRiel}`
    : "";
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
      setKhqr(await generateKhqr(profile.institute, toPaymentInvoice(invoice, profile.id)));
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
    onClose();
    setPaymentStep("methods");
  };

  const payWithAba = async () => {
    if (!invoice) return;
    setKhqrError(null);
    setKhqrLoading(true);
    try {
      const result = await generateKhqr(
        profile.institute,
        toPaymentInvoice(invoice, profile.id),
      );
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
    <Modal
      animationType="slide"
      onRequestClose={closePayment}
      transparent
      visible={visible}
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
                  <Ionicons name="arrow-back" size={20} color={c.primary} />
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
                      name={isSelected ? "radio-button-on" : "radio-button-off"}
                      size={21}
                      color={isSelected ? c.primary : "#a5b4ca"}
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
                  color={c.primary}
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
                    <ActivityIndicator size="large" color={c.primary} />
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
              <Text style={styles.providerDescription}>{p.qrDescription}</Text>
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
                <Ionicons name="copy-outline" size={17} color={c.primary} />
                <Text style={styles.copyReferenceText}>{p.copyReference}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (c: AccentColors) =>
  StyleSheet.create({
    payButtonPressed: { opacity: 0.82 },
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
    paymentMethodSelected: { backgroundColor: c.softer, borderColor: c.border },
    methodCopy: { flex: 1, marginLeft: 12 },
    paymentMethodLabel: { color: "#142c54", fontSize: 14, fontWeight: "600" },
    methodSubtitle: { color: "#8295b5", fontSize: 11, marginTop: 3 },
    confirmButton: {
      alignItems: "center",
      backgroundColor: c.primaryStrong,
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
    qrPanel: { alignItems: "center", paddingTop: 2 },
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
      color: c.primary,
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
      color: c.primary,
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 7,
    },
  });
