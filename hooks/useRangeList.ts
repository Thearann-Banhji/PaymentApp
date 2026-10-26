import { useEffect, useState } from "react";
import type { DateRange } from "../services/dateRange";

export type RangeListState<T> =
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; items: T[] };

/** Loads a list for the selected date range, with retry and stale-response protection. */
export function useRangeList<T>(fetchItems: (range: DateRange) => Promise<T[]>) {
  const [range, setRange] = useState<DateRange>("month");
  const [reloadCount, setReloadCount] = useState(0);
  const [state, setState] = useState<RangeListState<T>>({ status: "loading" });

  useEffect(() => {
    // Ignore responses from a range the user has already switched away from.
    let current = true;
    fetchItems(range)
      .then((items) => current && setState({ status: "done", items }))
      .catch((error) => {
        console.error("Unable to load list.", error);
        if (current) setState({ status: "error" });
      });
    return () => {
      current = false;
    };
  }, [fetchItems, range, reloadCount]);

  const selectRange = (next: DateRange) => {
    if (next === range) return;
    setState({ status: "loading" });
    setRange(next);
  };

  const retry = () => {
    setState({ status: "loading" });
    setReloadCount((count) => count + 1);
  };

  return { range, selectRange, state, retry };
}
