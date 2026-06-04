import { AdjuntoRequeridoAfiliacionInterna, DatosBeneficiarioAfiliacionInterna } from '../models/afiliacion-interna/validar-trabajador.interface';

/** Máximo de archivos por tipo de adjunto (alineado con portal empresa). */
export const MAX_ARCHIVOS_POR_TIPO_ADJUNTO = 3;

export interface ParentescoAdjuntoCatalogo {
  id: number;
  nombre: string;
  /** Código Genesys (ej. HIJO, CONYUGUE) para validar-beneficiario. */
  parentescoGenesys?: string | null;
  documentosRequeridos?: string;
  adjuntosNecesarios?: { id: number; nombreDocumento: string; esRequerido: boolean }[];
}

/** Normaliza soporte discapacidad guardado (legacy: un solo File). */
export function archivosSoporteDiscapacidadDesdePersona(
  valor: File | File[] | null | undefined
): File[] {
  if (valor == null) {
    return [];
  }
  if (Array.isArray(valor)) {
    return valor.slice(0, MAX_ARCHIVOS_POR_TIPO_ADJUNTO);
  }
  return [valor];
}

export interface SlotAdjuntoBeneficiario {
  id: number;
  nombreDocumento: string;
  esRequerido: boolean;
}

const ID_FALLBACK_REGISTRO_CIVIL = 3;
const ID_FALLBACK_DOCUMENTO_SOPORTE = 5;

export function resolverSlotsAdjuntosBeneficiario(
  datosBeneficiario: DatosBeneficiarioAfiliacionInterna | null | undefined,
  parentescosCatalogo?: ParentescoAdjuntoCatalogo[],
  parentescoIdSeleccionado?: string | number | null
): SlotAdjuntoBeneficiario[] {
  const slots = mapearAdjuntosDesdeBackend(datosBeneficiario?.adjuntosRequeridos);

  if (
    datosBeneficiario?.requiereAdjuntoRegistroCivil &&
    !slots.some(s => /registro\s*civil/i.test(s.nombreDocumento))
  ) {
    slots.push({
      id:
        buscarIdTipoAdjuntoPorNombre(/registro\s*civil/i, parentescosCatalogo, parentescoIdSeleccionado) ??
        ID_FALLBACK_REGISTRO_CIVIL,
      nombreDocumento: 'Registro civil',
      esRequerido: true,
    });
  }

  if (
    datosBeneficiario?.requiereAdjuntoDocumentoSoporte &&
    !slots.some(s => /soporte|documento\s*soporte/i.test(s.nombreDocumento))
  ) {
    slots.push({
      id:
        buscarIdTipoAdjuntoPorNombre(/soporte|documento\s*soporte/i, parentescosCatalogo, parentescoIdSeleccionado) ??
        ID_FALLBACK_DOCUMENTO_SOPORTE,
      nombreDocumento: 'Documento soporte',
      esRequerido: true,
    });
  }

  return slots;
}

function mapearAdjuntosDesdeBackend(
  adj: AdjuntoRequeridoAfiliacionInterna[] | null | undefined
): SlotAdjuntoBeneficiario[] {
  if (!adj?.length) {
    return [];
  }
  const vistos = new Set<number>();
  const out: SlotAdjuntoBeneficiario[] = [];
  for (const a of adj) {
    const id = Number(a?.id);
    if (a?.id == null || Number.isNaN(id) || vistos.has(id)) {
      continue;
    }
    vistos.add(id);
    out.push({
      id,
      nombreDocumento: (a.nombreDocumento ?? '').toString().trim(),
      esRequerido: a.esRequerido !== false,
    });
  }
  return out;
}

function buscarIdTipoAdjuntoPorNombre(
  patron: RegExp,
  parentescosCatalogo?: ParentescoAdjuntoCatalogo[],
  parentescoIdSeleccionado?: string | number | null
): number | undefined {
  if (parentescoIdSeleccionado != null && parentescosCatalogo?.length) {
    const p = parentescosCatalogo.find(x => String(x.id) === String(parentescoIdSeleccionado));
    const id = p?.adjuntosNecesarios?.find(a => patron.test((a.nombreDocumento ?? '').trim()))?.id;
    if (id != null && !Number.isNaN(Number(id))) {
      return Number(id);
    }
  }
  for (const p of parentescosCatalogo ?? []) {
    for (const a of p.adjuntosNecesarios ?? []) {
      if (patron.test((a.nombreDocumento ?? '').trim()) && a.id != null) {
        return Number(a.id);
      }
    }
  }
  return undefined;
}
