import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  useTheme,
  useThemedStyles,
  type AccentColors,
} from "../theme/ThemeProvider";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  statusLabel: string;
  /** Badge is green when paid, orange otherwise. */
  paid: boolean;
  footerLabel: string;
  amount: string;
};

/** Invoice / receipt card; accent colours follow the selected theme. */
export const DocumentCard = memo(function DocumentCard({
  icon,
  title,
  subtitle,
  statusLabel,
  paid,
  footerLabel,
  amount,
}: Props) {
  const { colors: c } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={22} color={c.primary} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.status, paid && styles.statusPaid]}>
          <Text
            style={[styles.statusText, paid && styles.statusTextPaid]}
          >
            {statusLabel}
          </Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.footer}>
        <Text numberOfLines={1} style={styles.footerLabel}>
          {footerLabel}
        </Text>
        <Text style={styles.amount}>{amount}</Text>
      </View>
    </View>
  );
});

const createStyles = (c: AccentColors) =>
  StyleSheet.create({
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
      backgroundColor: c.soft,
      borderRadius: 22,
      height: 44,
      justifyContent: "center",
      width: 44,
    },
    copy: { flex: 1, marginLeft: 12 },
    title: { color: "#142c54", fontSize: 15, fontWeight: "700" },
    subtitle: { color: "#8295b5", fontSize: 12, marginTop: 4 },
    status: {
      backgroundColor: "#fff0d7",
      borderRadius: 14,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    statusText: { color: "#e77a00", fontSize: 11, fontWeight: "700" },
    statusPaid: { backgroundColor: "#e3f7ea" },
    statusTextPaid: { color: "#1f9254" },
    divider: { backgroundColor: "#e7edf6", height: 1, marginVertical: 17 },
    footer: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    footerLabel: { color: "#7489ad", flex: 1, fontSize: 13, marginRight: 12 },
    amount: { color: c.primary, fontSize: 23, fontWeight: "800" },
  });
