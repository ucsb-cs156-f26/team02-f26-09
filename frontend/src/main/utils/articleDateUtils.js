// The backend stores an article's dateAdded as a ZonedDateTime. Depending on
// the server's time zone, the API returns it in UTC ("2026-10-29T10:30:00Z")
// or with an offset ("2026-10-29T03:30:00-07:00"). A datetime-local input
// can't show a zone, so forms convert the value to UTC, show that date and
// time, and add the "Z" back on submit.

export function toDateTimeLocal(dateAdded) {
  return new Date(dateAdded).toISOString().slice(0, 19);
}

export function toUtcIsoString(dateTimeLocal) {
  const withSeconds =
    dateTimeLocal.length === 16 ? dateTimeLocal + ":00" : dateTimeLocal;
  return withSeconds + "Z";
}
