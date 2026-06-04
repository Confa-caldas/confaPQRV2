import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Nombres y apellidos: solo letras (incl. tildes, ñ, ü), espacio, guion, punto y apóstrofo. Sin dígitos.
 */
export const PATRON_SOLO_LETRAS_NOMBRES_APELLIDOS = /^[\p{L} \-'.]+$/u;

export const validadorSoloLetrasNombresApellido: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const raw = control.value;
  if (raw == null || String(raw).trim() === '') {
    return null;
  }
  return PATRON_SOLO_LETRAS_NOMBRES_APELLIDOS.test(String(raw)) ? null : { soloLetrasNombres: true };
};
