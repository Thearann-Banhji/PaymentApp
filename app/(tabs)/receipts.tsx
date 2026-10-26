import { useCallback } from "react";
import { DocumentCard } from "../../components/DocumentCard";
import { RangeListScreen } from "../../components/RangeListScreen";
import { useProfileDetails } from "../../hooks/useProfileDetails";
import { useLanguage } from "../../i18n/LanguageProvider";
import type { DateRange } from "../../services/dateRange";
import { getReceipts, type Receipt } from "../../services/receipts";

export default function ReceiptsScreen() {
  const { institute, id } = useProfileDetails();
  const { t, formatDate, formatRiel } = useLanguage();
  const fetchReceipts = useCallback(
    (range: DateRange) => getReceipts(institute, id, range),
    [institute, id],
  );

  return (
    <RangeListScreen
      eyebrow={t.receipts.eyebrow}
      title={t.tabs.receipts}
      subtitle={t.receipts.subtitle}
      emptyText={t.receipts.empty}
      fetchItems={fetchReceipts}
      renderItem={(receipt: Receipt) => (
        <DocumentCard
          key={receipt.id}
          icon="receipt-outline"
          title={receipt.reference}
          subtitle={
            receipt.method
              ? `${formatDate(receipt.date)} · ${receipt.method}`
              : formatDate(receipt.date)
          }
          statusLabel={t.receipts.paid}
          paid
          footerLabel={t.receipts.forInvoice(receipt.invoiceReference)}
          amount={formatRiel(receipt.amountInRiel)}
        />
      )}
    />
  );
}
