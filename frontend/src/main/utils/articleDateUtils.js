// The backend stores an article's dateAdded as a ZonedDateTime and returns it
// in UTC, e.g. "2026-10-29T05:26:03Z". A datetime-local input can't show the
// zone, so forms display the UTC date and time and add the "Z" back on submit.

export function toDateTimeLocal(dateAdded) {
  return dateAdded.slice(0, 19);
}

export function toUtcIsoString(dateTimeLocal) {
  const withSeconds =
    dateTimeLocal.length === 16 ? dateTimeLocal + ":00" : dateTimeLocal;
  return withSeconds + "Z";
}
