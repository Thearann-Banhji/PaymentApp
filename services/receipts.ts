import { rangeDates, type DateRange } from "./dateRange";

// Production: https://apis.banhji.com/transaction-billing/txn/institute
const TXN_LIST_URL = "https://dev-apis.banhji.com/transaction-billing/txn/institute";

export type Receipt = {
  id: string;
  /** Receipt number, e.g. OR-2610-00001. */
  reference: string;
  /** Invoice the receipt pays, e.g. CI-2603-00068. */
  invoiceReference: string;
  date: string;
  amountInRiel: number;
  method: string;
};

type TxnListItem = {
  id: string;
  receiptReferenceNo: string;
  txnReferenceNo: string;
  transactionDate: string;
  paidAmount: number;
  paymentOption?: { name?: string };
};

export async function getReceipts(
  instituteId: string,
  customerId: string,
  range: DateRange,
): Promise<Receipt[]> {
  const response = await fetch(`${TXN_LIST_URL}/${instituteId}/list`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      search: "",
      type: "Cash Receipt",
      ...rangeDates(range),
      filter: 1,
      isSummarize: 0,
      cusId: customerId,
      key: {},
    }),
  });
  if (!response.ok) {
    throw new Error(`Receipt list request failed (${response.status})`);
  }
  const body = (await response.json()) as { data?: TxnListItem[] };
  return (body.data ?? []).map((item) => ({
    id: item.id,
    reference: item.receiptReferenceNo,
    invoiceReference: item.txnReferenceNo,
    date: item.transactionDate.slice(0, 10),
    amountInRiel: item.paidAmount,
    method: item.paymentOption?.name ?? "",
  }));
}
