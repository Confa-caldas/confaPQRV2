import { ParentescoAdjuntoCatalogo } from '../../utils/beneficiario-adjuntos.util';

/** Parentescos que solo admiten un beneficiario por solicitud (MADRE, PADRE, CÓNYUGE). */
export type CategoriaParentescoExclusivo = 'madre' | 'padre' | 'conyuge';

function normalizarCodigoGenesys(g: string | null | undefined): string {
  return (g ?? '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function resolverCategoriaParentescoExclusivo(
  parentescoGenesys: string | null | undefined,
  nombreParentesco: string | null | undefined
): CategoriaParentescoExclusivo | null {
  const g = normalizarCodigoGenesys(parentescoGenesys);
  if (g === 'MADRE') {
    return 'madre';
  }
  if (g === 'PADRE') {
    return 'padre';
  }
  if (g === 'CONYUGUE' || g === 'CONYUGE' || g.includes('CONYUG')) {
    return 'conyuge';
  }

  const n = (nombreParentesco ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (n === 'madre') {
    return 'madre';
  }
  if (n === 'padre') {
    return 'padre';
  }
  if (n.includes('conyug')) {
    return 'conyuge';
  }
  return null;
}

export function cuentaParentescoExclusivoEnLista(
  lista: { parentesco: string }[],
  parentescosCatalogo: ParentescoAdjuntoCatalogo[],
  categoria: CategoriaParentescoExclusivo,
  excluirIndice: number | null | undefined
): number {
  let n = 0;
  lista.forEach((b, i) => {
    if (excluirIndice != null && i === excluirIndice) {
      return;
    }
    const nombre = (b.parentesco ?? '').trim();
    const opt =
      parentescosCatalogo.find(p => p.nombre === nombre) ||
      parentescosCatalogo.find(p => p.nombre.trim().toLowerCase() === nombre.toLowerCase());
    const cat = resolverCategoriaParentescoExclusivo(opt?.parentescoGenesys, nombre);
    if (cat === categoria) {
      n++;
    }
  });
  return n;
}

export function existeBeneficiarioDuplicadoPorDocumentoEnLista(
  lista: { tipoDocumento: string; numeroDocumento: string }[],
  tipoDoc: string,
  numeroDoc: string,
  excluirIndice: number | null | undefined
): boolean {
  const t = (tipoDoc ?? '').toString().trim().toUpperCase();
  const n = (numeroDoc ?? '').toString().trim();
  if (!t || !n) {
    return false;
  }
  return lista.some((b, i) => {
    if (excluirIndice != null && i === excluirIndice) {
      return false;
    }
    const bt = (b.tipoDocumento ?? '').toString().trim().toUpperCase();
    const bn = (b.numeroDocumento ?? '').toString().trim();
    return bt === t && bn === n;
  });
}

export function mensajeParentescoExclusivoDuplicado(categoria: CategoriaParentescoExclusivo): string {
  const etiquetas: Record<CategoriaParentescoExclusivo, string> = {
    madre: 'Madre',
    padre: 'Padre',
    conyuge: 'Cónyuge',
  };
  return (
    `Por este tipo de parentesco (${etiquetas[categoria]}) solo puede registrar una persona en esta solicitud. ` +
    'Ya existe un beneficiario con ese parentesco en el listado.'
  );
}
