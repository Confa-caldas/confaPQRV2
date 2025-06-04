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

export function ceDocumentValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  const root = control?.parent;

  if (!root) return null;

  const docType = root.get('legalRepresentativeDocumentType')?.value;

  if (!value || docType?.code !== 'E') {
    return null;
  }

  if (value.length > 7) {
    return { maxLengthCE: true };
  }

  const isConsecutive = (val: string) => {
    for (let i = 0; i < val.length - 1; i++) {
      if (+val[i + 1] !== +val[i] + 1) {
        return false;
      }
    }
    return true;
  };

  if (isConsecutive(value)) {
    return { consecutiveDigits: true };
  }

  return null;
}

export function noConsecutiveValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value;

  if (!value || value.length < 3) {
    return null;
  }

  for (let i = 0; i < value.length - 1; i++) {
    if (parseInt(value[i + 1], 10) !== parseInt(value[i], 10) + 1) {
      return null;
    }
  }

  return { consecutiveDigits: true };
}
