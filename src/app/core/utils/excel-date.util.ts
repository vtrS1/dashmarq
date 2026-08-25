/** Converts an Excel (1900 date system) serial number to a JS Date, UTC-anchored. */
export function excelSerialToDate(serial: number | null | undefined): Date | null {
  if (serial == null || Number.isNaN(serial)) return null;
  const utcDays = Math.floor(serial - 25569); // 25569 = days between 1899-12-30 and 1970-01-01
  return new Date(utcDays * 86400 * 1000);
}

/** Whole days between two dates (positive when `to` is after `from`). */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}
