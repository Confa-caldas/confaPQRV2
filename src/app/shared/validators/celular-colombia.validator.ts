import { AbstractControl, ValidationErrors } from '@angular/forms';

/** Celular Colombia: 10 dígitos, inicia con 3 o 6. Si está vacío, no marca error (lo cubre `required`). */
export function validadorCelularColombia(control: AbstractControl): ValidationErrors | null {
  const digits = (control.value ?? '').toString().replace(/\D/g, '');
  if (!digits.length) return null;
  const v = digits.length > 10 ? digits.slice(-10) : digits;
  if (!/^[36]\d{9}$/.test(v)) {
    return { celularFormato: true };
  }
  return null;
}
