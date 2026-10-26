export type DateRange = "month" | "3months" | "6months" | "year";

export const DATE_RANGES: DateRange[] = ["month", "3months", "6months", "year"];

const RANGE_MONTHS: Record<DateRange, number> = {
  month: 1,
  "3months": 3,
  "6months": 6,
  year: 12,
};

function formatDay(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Whole calendar months ending with the current one, e.g. 3 months = Aug 1 – Oct 31. */
export function rangeDates(range: DateRange) {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth() - RANGE_MONTHS[range] + 1,
    1,
  );
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: formatDay(start), end: formatDay(end) };
}
