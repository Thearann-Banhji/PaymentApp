import type { Invoice } from "../constants/invoice";
import { rangeDates, type DateRange } from "./dateRange";

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

// Production: https://apis.banhji.com/transaction-billing/invoice/institute
const INVOICE_LIST_URL =
  "https://dev-apis.banhji.com/transaction-billing/invoice/institute";

export type InvoiceHistoryItem = Invoice & { paid: boolean };

type InvoiceListItem = {
  id: string;
  referenceNo: string;
  date: string;
  /** Amount in KHR; exchangeAmount is the base-currency value. */
  amount: number;
  remainingAmount: number;
};

export async function getInvoiceHistory(
  instituteId: string,
  customerId: string,
  range: DateRange,
): Promise<InvoiceHistoryItem[]> {
  const response = await fetch(`${INVOICE_LIST_URL}/${instituteId}/list`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      search: "",
      type: "Invoice funnel",
      ...rangeDates(range),
      key: {},
      isSummarize: 0,
      empId: "",
      id: customerId,
      segId: "",
      locId: "",
      status: 0,
      referenceNo: "",
      invType: "-",
    }),
  });
  if (!response.ok) {
    throw new Error(`Invoice list request failed (${response.status})`);
  }
  const body = (await response.json()) as { data?: InvoiceListItem[] };
  return (body.data ?? []).map((item) => ({
    id: item.id,
    code: "",
    reference: item.referenceNo,
    date: item.date.slice(0, 10),
    amountInRiel: item.amount,
    paid: item.remainingAmount <= 0,
  }));
}
