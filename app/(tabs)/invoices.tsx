import { useCallback } from "react";
import { DocumentCard } from "../../components/DocumentCard";
import { RangeListScreen } from "../../components/RangeListScreen";
import { useProfileDetails } from "../../hooks/useProfileDetails";
import { useLanguage } from "../../i18n/LanguageProvider";
import type { DateRange } from "../../services/dateRange";
import {
  getInvoiceHistory,
  type InvoiceHistoryItem,
} from "../../services/invoices";

export default function InvoicesScreen() {
  const { institute, id } = useProfileDetails();
  const { t, formatDate, formatRiel } = useLanguage();
  const fetchInvoices = useCallback(
    (range: DateRange) => getInvoiceHistory(institute, id, range),
    [institute, id],
  );

  return (
    <RangeListScreen
      eyebrow={t.invoices.eyebrow}
      title={t.tabs.invoices}
      subtitle={t.invoices.subtitle}
      emptyText={t.invoices.empty}
      fetchItems={fetchInvoices}
      renderItem={(invoice: InvoiceHistoryItem) => (
        <DocumentCard
          key={invoice.id}
          icon="document-text-outline"
          title={invoice.reference}
          subtitle={t.invoices.issued(formatDate(invoice.date))}
          statusLabel={invoice.paid ? t.invoices.paid : t.invoices.unpaid}
          paid={invoice.paid}
          footerLabel={invoice.paid ? t.invoices.amount : t.invoices.amountDue}
          amount={formatRiel(invoice.amountInRiel)}
        />
      )}
    />
  );
}
