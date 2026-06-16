/** Mensajes de validación de fechas de nacimiento y expedición. */
export const MSG_FECHA_NACIMIENTO_FUTURA =
  'La fecha de nacimiento no puede ser posterior a la fecha de hoy.';
export const MSG_FECHA_EXPEDICION_FUTURA =
  'La fecha de expedición no puede ser posterior a la fecha de hoy.';
export const MSG_FECHA_EXPEDICION_ANTES_NACIMIENTO =
  'La fecha de expedición no puede ser anterior a la fecha de nacimiento.';

/** Fecha local de hoy en formato YYYY-MM-DD (atributo max/min de input type="date"). */
export function fechaHoyComoInputDate(fechaReferencia?: Date): string {
  const hoy = fechaReferencia ? new Date(fechaReferencia) : new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, '0');
  const d = String(hoy.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Normaliza valor de formulario a YYYY-MM-DD cuando es posible. */
export function valorComoInputDate(val: unknown): string {
  if (val == null || val === '') return '';
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    return fechaHoyComoInputDate(val);
  }
  const s = String(val).trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return s;
}

export function parseFechaInputDate(val: unknown): Date | null {
  const s = valorComoInputDate(val);
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, mo, d] = s.split('-').map(Number);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

export function esFechaFutura(val: unknown, fechaReferencia?: Date): boolean {
  const f = parseFechaInputDate(val);
  if (!f) return false;
  const hoy = fechaReferencia ? new Date(fechaReferencia) : new Date();
  hoy.setHours(0, 0, 0, 0);
  f.setHours(0, 0, 0, 0);
  return f > hoy;
}

export function esExpedicionAnteriorANacimiento(fechaNac: unknown, fechaExp: unknown): boolean {
  const n = parseFechaInputDate(fechaNac);
  const e = parseFechaInputDate(fechaExp);
  if (!n || !e) return false;
  n.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  return e < n;
}

export function validarFechasNacimientoYExpedicion(
  fechaNac: unknown,
  fechaExp: unknown
): { valido: boolean; mensaje?: string } {
  if (esFechaFutura(fechaNac)) {
    return { valido: false, mensaje: MSG_FECHA_NACIMIENTO_FUTURA };
  }
  if (fechaExp != null && String(fechaExp).trim() !== '' && esFechaFutura(fechaExp)) {
    return { valido: false, mensaje: MSG_FECHA_EXPEDICION_FUTURA };
  }
  if (
    fechaExp != null &&
    String(fechaExp).trim() !== '' &&
    esExpedicionAnteriorANacimiento(fechaNac, fechaExp)
  ) {
    return { valido: false, mensaje: MSG_FECHA_EXPEDICION_ANTES_NACIMIENTO };
  }
  return { valido: true };
}
