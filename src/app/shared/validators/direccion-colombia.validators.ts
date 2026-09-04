import { Validators, ValidatorFn } from '@angular/forms';

export const REGEX_DIRECCION_COLOMBIA =
  '^(?=.{8,80}$)[A-Za-zÁÉÍÓÚáéíóúÑñ0-9#.\\-°\\s]+$';

export const validatorsDireccionColombia: ValidatorFn[] = [
  Validators.minLength(8),
  Validators.maxLength(80),
  Validators.pattern(REGEX_DIRECCION_COLOMBIA),
];

export const validatorsDireccionColombiaOpcional: ValidatorFn[] = [
  Validators.maxLength(80),
  Validators.pattern(REGEX_DIRECCION_COLOMBIA),
];

export const MENSAJE_DIRECCION_INVALIDA =
  'Entre 8 y 80 caracteres. Solo letras (con tildes y ñ), números y los caracteres # - . °';
