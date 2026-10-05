// Utilidades de fecha en hora local (Chile). Todas las fechas se guardan como 'YYYY-MM-DD'.
export const DIAS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
export const DIAS_LARGOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function iso(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export function parse(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function addDays(s, n) {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return iso(d);
}
export function addWeeks(s, n) { return addDays(s, n * 7); }
/** Índice 0 = lunes … 6 = domingo */
export function weekday(s) { return (parse(s).getDay() + 6) % 7; }
export function mondayOf(s) { return addDays(s, -weekday(s)); }
export function weeksBetween(a, b) { return Math.round((parse(b) - parse(a)) / (7 * 864e5)); }
export function daysBetween(a, b) { return Math.round((parse(b) - parse(a)) / 864e5); }
export function today() { return iso(new Date()); }
export function largo(s) {
  const d = parse(s);
  return `${DIAS_LARGOS[weekday(s)]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
}
export function mesAnio(s) {
  const d = parse(s);
  return `${MESES_CORTOS[d.getMonth()]} ${d.getFullYear()}`;
}
export function corto(s) {
  const d = parse(s);
  return `${d.getDate()} ${MESES_CORTOS[d.getMonth()]}`;
}
export function lastDayOfMonth(y, m) { return iso(new Date(y, m + 1, 0)); }
