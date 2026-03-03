export function isoDateKey(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function displayFromISO(dateInput, locale = 'es-ES') {
  const key = isoDateKey(dateInput);
  if (!key) return '';
  const [y, m, d] = key.split('-').map((s) => parseInt(s, 10));
  // Build a local Date at midnight for correct display in user's timezone
  const local = new Date(y, m - 1, d);
  return local.toLocaleDateString(locale);
}

export default { isoDateKey, displayFromISO };
