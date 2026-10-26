type Listener = () => void;

const listeners = new Set<Listener>();

/** Asks the Home screen to open its payment sheet (used by the center tab button). */
export function requestPayment() {
  listeners.forEach((listener) => listener());
}

export function onPaymentRequest(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
