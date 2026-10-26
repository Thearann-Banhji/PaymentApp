# Banhji

A cross-platform customer bill-payment app built with Expo, React Native, and TypeScript. The interface is designed for iOS and Android and follows the supplied customer-home reference.

## Run the app

```sh
npm install
npm run start
```

## Test on Android

This project uses Expo SDK 58. If the latest Expo Go on your device does not support this SDK, install a local development build instead:

1. Install Android Studio and its Android SDK on your computer.
2. On your Android phone, enable Developer options and USB debugging, then connect it with USB.
3. From this project folder, build and install the development app:

   ```sh
   npm run android:dev
   ```

4. Start the development server:

   ```sh
   npm run start -- --dev-client
   ```

5. Open the installed **Banhji** development app on your phone.

The first Android build requires Android Studio's Android SDK and Java/Gradle build tools. The development build is separate from Expo Go and matches this project's native SDK.

## Current scope

- Customer home screen with account and unpaid-invoice details
- Invoice, receipt, and profile tabs
- QR sign-in scanner interface and profile sign-out
- Copy actions for customer contact and contract information
- ABA Bank and KHQR payment-method preview
- A clearly labeled demo QR code in KHR

Sign-in currently opens the sample account through an explicitly labeled demo option. Scanned QR codes are not authenticated; connect a secure sign-in service to validate them. Payments use sample data only. The displayed payment QR code is not a valid payment request. Connect ABA PayWay and a Bakong merchant account through a secure backend before processing real transactions.
