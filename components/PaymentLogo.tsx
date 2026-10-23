import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

export type PaymentProvider = 'aba' | 'khqr';

// Drop official brand files in assets/payment/ and reference them here, e.g.
// aba: require('../assets/payment/aba.png'). Until then a text badge is shown.
const logoImages: Partial<Record<PaymentProvider, ImageSourcePropType>> = {};

const badges = {
  aba: { text: 'ABA', background: '#0b5e7d', color: '#ffffff' },
  khqr: { text: null, background: '#e1251b', color: '#ffffff' },
} as const;

export function PaymentLogo({ provider, size = 38 }: { provider: PaymentProvider; size?: number }) {
  const frame = { borderRadius: size * 0.28, height: size, width: size };
  const image = logoImages[provider];

  if (image) {
    return <Image accessibilityIgnoresInvertColors resizeMode="contain" source={image} style={frame} />;
  }

  const badge = badges[provider];
  return (
    <View style={[styles.badge, frame, { backgroundColor: badge.background }]}>
      {badge.text ? (
        <Text style={[styles.text, { color: badge.color, fontSize: size * 0.32 }]}>{badge.text}</Text>
      ) : (
        <Ionicons name="qr-code" size={size * 0.55} color={badge.color} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '800', letterSpacing: 0.5 },
});
