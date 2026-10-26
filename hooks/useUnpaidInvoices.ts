import { useCallback, useEffect, useMemo, useState } from "react";
import type { Invoice } from "../constants/invoice";
import { useProfileDetails } from "./useProfileDetails";
import { getCustomerInvoices } from "../services/invoices";

/** The customer's unpaid invoices, plus their count and total, with retry. */
export function useUnpaidInvoices() {
  const { institute, id } = useProfileDetails();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchInvoices = useCallback(
    () =>
      getCustomerInvoices(institute, id)
        .then(setInvoices)
        .catch((err) => {
          console.error("Unable to load invoices.", err);
          setError(true);
        })
        .finally(() => setLoading(false)),
    [institute, id],
  );

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const retry = () => {
    setLoading(true);
    setError(false);
    fetchInvoices();
  };

  const totalAmount = useMemo(
    () => invoices.reduce((sum, invoice) => sum + invoice.amountInRiel, 0),
    [invoices],
  );

  return { invoices, loading, error, retry, totalAmount };
}
