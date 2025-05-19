import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function commonEmailDomainValidator(): ValidatorFn {
  const knownDomains = [
    // Gmail y Google
    'gmail.com',
    'googlemail.com',

    // Outlook / Hotmail
    'hotmail.com',
    'hotmail.es',
    'hotmail.co.uk',
    'outlook.com',
    'outlook.es',
    'outlook.com.br',
    'outlook.co.uk',
    'live.com',
    'live.es',

    // Yahoo
    'yahoo.com',
    'yahoo.es',
    'yahoo.co.uk',
    'ymail.com',
    'rocketmail.com',

    // Apple
    'icloud.com',
    'me.com',
    'mac.com'
  ];


  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.value;
    if (!email || typeof email !== 'string') return null;

    const parts = email.split('@');
    if (parts.length !== 2) return null;

    const domain = parts[1].toLowerCase();

    // Si es exactamente uno de los conocidos, es válido
    if (knownDomains.includes(domain)) return null;

    // Verifica similitud con dominios conocidos
    for (const known of knownDomains) {
      if (levenshteinDistance(domain, known) <= 2) {
        return { commonDomainTypo: { suggested: known } };
      }
    }

    return null; // No es conocido ni similar, se acepta como lo escribió el usuario
  };
}

// Función para medir la "distancia" entre cadenas
function levenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] =
        a[i - 1] === b[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j] + 1, // delete
              matrix[i][j - 1] + 1, // insert
              matrix[i - 1][j - 1] + 1 // substitute
            );
    }
  }

  return matrix[a.length][b.length];
}
