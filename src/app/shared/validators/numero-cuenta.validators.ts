import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Detección de números de cuenta inválidos por patrón (no por longitud, que ya valida el banco):
 * secuencias de un solo dígito repetido (ej. 0, 0000000000, 111111, 999999) y secuencias numéricas
 * consecutivas ascendentes o descendentes (ej. 12345678, 87654321).
 */
export function esSecuenciaNumericaInvalida(valor: string | null | undefined): boolean {
  const digitos = (valor ?? '').toString().trim();
  if (!digitos || !/^\d+$/.test(digitos)) {
    return false;
  }
  // Un solo dígito repetido (incluye "0" solo y cadenas de ceros).
  if (/^(\d)\1*$/.test(digitos)) {
    return true;
  }
  if (digitos.length < 3) {
    return false;
  }
  let ascendente = true;
  let descendente = true;
  for (let i = 1; i < digitos.length; i++) {
    const anterior = Number(digitos[i - 1]);
    const actual = Number(digitos[i]);
    if (actual !== anterior + 1) ascendente = false;
    if (actual !== anterior - 1) descendente = false;
  }
  return ascendente || descendente;
}

/** Mensaje mostrado en rojo debajo del campo cuando el número de cuenta es inválido por patrón. */
export const MSG_NUMERO_CUENTA_INVALIDO =
  'El número de cuenta ingresado no es válido. Por favor verifique e intente nuevamente.';

/** Validador reactivo: marca el control inválido (error `secuenciaInvalida`) si el valor es una secuencia no válida. */
export const validatorNumeroCuentaSecuencia: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  return esSecuenciaNumericaInvalida(control.value) ? { secuenciaInvalida: true } : null;
};
