const KHQR_URL = "https://apis.banhji.com/payment/v1/khqr";
// The KHQR API only allows banhji.com subdomains; the bare domain gets 403.
const KHQR_ORIGIN = "https://app.banhji.com";

export type KhqrRequest = {
  merchant_id: string;
  provider: string;
  tran_id: string;
  amount: string;
  currency: "USD" | "KHR";
  crn: string;
  institute: string;
  qr_image_template: string;
  lifetime: number;
};

export type KhqrResult = {
  /** Image URL or data URI of the rendered QR, if the API returns one. */
  image?: string;
  /** Raw KHQR string, if the API returns one. */
  qrString?: string;
  /** Bank app deep link (e.g. abamobilebank://...) to pay in-app. */
  deeplink?: string;
  raw: unknown;
};

const BANK_CONNECTION_URL =
  "https://dev-apis.banhji.com/pay-subscriptions/connectionBankPayment/institute";

export type BankConnection = {
  active: boolean;
  pk: string;
  sk: string;
  description: string;
  /** Older responses used merchantName; current ones use merchantId. */
  merchantId?: string;
  merchantName?: string;
  number: string;
  localName: string;
  localDescription: string;
  createdAt: string;
  bankAccountType: string;
  bankId: string;
  bankName: string;
  currency: "USD" | "KHR";
  name: string;
};

const connectionCache = new Map<string, Promise<BankConnection>>();

/** Bank connection per institute, fetched once and reused (dropped on failure). */
export function getBankConnection(instituteId: string): Promise<BankConnection> {
  let request = connectionCache.get(instituteId);
  if (!request) {
    request = fetchBankConnection(instituteId);
    request.catch(() => connectionCache.delete(instituteId));
    connectionCache.set(instituteId, request);
  }
  return request;
}

async function fetchBankConnection(
  instituteId: string,
): Promise<BankConnection> {
  const response = await fetch(`${BANK_CONNECTION_URL}/${instituteId}/get`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Bank connection request failed (${response.status})`);
  }
  const body = (await response.json()) as { data?: BankConnection };
  if (!body.data) throw new Error("No bank connection found.");
  if (!body.data.active) throw new Error("Bank connection is not active.");
  const merchantId = body.data.merchantId ?? body.data.merchantName;
  if (!merchantId) throw new Error("Bank connection has no merchant ID.");
  return { ...body.data, merchantId };
}

export function buildKhqrRequest(
  connection: BankConnection,
  amount: number,
  tranId: string,
): KhqrRequest {
  return {
    merchant_id: connection.merchantId!,
    provider: connection.bankId.replace(/^client-/, ""),
    tran_id: tranId,
    amount: amount.toFixed(2),
    currency: connection.currency,
    crn: "No",
    institute: connection.pk,
    qr_image_template: "template2_color",
    lifetime: 25,
  };
}

const IMAGE_KEYS = ["qrData", "qr_image", "qrImage", "image", "qr_image_url", "qrImageUrl"];
const STRING_KEYS = ["qr_string", "qrString", "qr", "khqr", "qrCode", "qr_code"];

function pick(source: unknown, keys: string[]): string | undefined {
  if (!source || typeof source !== "object") return undefined;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    if (typeof record[key] === "string" && record[key]) {
      return record[key] as string;
    }
  }
  return pick(record.data, keys);
}

function toImageUri(value: string) {
  if (/^(https?:|data:)/.test(value)) return value;
  return `data:image/png;base64,${value}`;
}

const PAYMENT_PAYLOAD_URL = "https://dev-apis.banhji.com/pay-subscriptions/v3";

export type PaymentInvoice = {
  /** Invoice transaction id (txn-...). */
  transactionId: string;
  /** Invoice reference number, e.g. CI-2603-00068. */
  invoiceNo: string;
  /** Invoice code, used as the bank tran_id. */
  tranId: string;
  customerId: string;
  amount: number;
  type?: string;
};

const createdPayments = new Map<string, Promise<void>>();

/**
 * Registers the payment with BanhJi before the bank QR/deeplink is generated.
 * Created once per institute + tran_id so retries don't duplicate it.
 */
export function createPaymentPayload(
  instituteId: string,
  currency: BankConnection["currency"],
  invoice: PaymentInvoice,
): Promise<void> {
  const key = `${instituteId}:${invoice.tranId}`;
  let request = createdPayments.get(key);
  if (!request) {
    request = postPaymentPayload(instituteId, currency, invoice);
    request.catch(() => createdPayments.delete(key));
    createdPayments.set(key, request);
  }
  return request;
}

async function postPaymentPayload(
  instituteId: string,
  currency: BankConnection["currency"],
  invoice: PaymentInvoice,
) {
  const response = await fetch(
    `${PAYMENT_PAYLOAD_URL}/${instituteId}/payload/create`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currency,
        amount: invoice.amount,
        transaction_id: invoice.transactionId,
        invoiceNo: invoice.invoiceNo,
        customer_id: invoice.customerId,
        tran_id: invoice.tranId,
        billPayment: true,
      }),
    },
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Create payment failed (${response.status}): ${text.slice(0, 200)}`,
    );
  }
}

export async function generateKhqr(
  instituteId: string,
  invoice: PaymentInvoice,
): Promise<KhqrResult> {
  const connection = await getBankConnection(instituteId);
  await createPaymentPayload(instituteId, connection.currency, invoice);
  const request = buildKhqrRequest(connection, invoice.amount, invoice.tranId);

  const response = await fetch(KHQR_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      // The KHQR API returns 403 "Origin not allowed" without an allowed origin.
      Origin: KHQR_ORIGIN,
    },
    body: JSON.stringify(request),
  });

  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // Non-JSON response; keep the raw text.
  }

  if (!response.ok) {
    throw new Error(`KHQR request failed (${response.status}): ${text.slice(0, 200)}`);
  }

  if (body && typeof body === "object" && (body as { error?: unknown }).error) {
    const { message, msg } = body as { message?: string; msg?: string };
    throw new Error(message ?? msg ?? "Could not generate KHQR.");
  }

  const image = pick(body, IMAGE_KEYS);
  return {
    image: image ? toImageUri(image) : undefined,
    qrString: pick(body, STRING_KEYS),
    deeplink: pick(body, ["deeplink", "deepLink"]),
    raw: body,
  };
}
