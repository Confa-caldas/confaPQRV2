import { Validators } from '@angular/forms';

/**
 * Letras (tildes, ñ), números, espacios, puntuación y símbolos (#, $, %, &, etc.).
 * Usa categorías Unicode: L letras, M marcas, N números, P puntuación, S símbolos.
 */
export const SPANISH_TEXT_PATTERN = /^[\p{L}\p{M}\p{N}\p{P}\p{S}\s]+$/u;

export const spanishTextValidators = [
  Validators.required,
  Validators.pattern(SPANISH_TEXT_PATTERN),
];
