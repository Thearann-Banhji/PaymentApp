import type { Invoice } from "../constants/invoice";

const RECEIVABLE_URL =
  "https://dev-apis.banhji.com/transaction-billing/wcp-receivable/institute";

type ReceivableItem = {
  id: string;
  code: string;
  referenceNo: string;
  date: string;
  amount: number;
  currency: string;
};

/** Last day of the current month as YYYY-MM-DD. */
function endOfMonth() {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
}

export async function getCustomerInvoices(
  instituteId: string,
  customerId: string,
): Promise<Invoice[]> {
  const response = await fetch(`${RECEIVABLE_URL}/${instituteId}/list`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      asOf: endOfMonth(),
      tid: "",
      grid: "",
      key: {},
      id: customerId,
      type: "cus",
    }),
  });
  if (!response.ok) {
    throw new Error(`Invoice request failed (${response.status})`);
  }
  const body = (await response.json()) as { data?: ReceivableItem[] };
  return (body.data ?? []).map((item) => ({
    id: item.id,
    code: item.code,
    reference: item.referenceNo,
    date: item.date,
    amountInRiel: item.amount,
  }));
}
