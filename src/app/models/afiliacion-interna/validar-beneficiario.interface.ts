import {
  DatosFormularioAfiliacionInterna,
  ValidacionResultAfiliacionInterna,
} from './validar-trabajador.interface';

/** Ítem opcional: beneficiarios ya agregados con número de grupo asignado. */
export interface BeneficiarioGrupoBorradorItem {
  tipoDocumento: string;
  numeroDocumento: string;
  tipoBeneficiario?: string | null;
  numeroGrupoFamiliar: number;
}

/** Request POST validar-beneficiario. */
export interface ValidarBeneficiarioRequestBody {
  tipoDocumento: string;
  numeroDocumento: string;
  idEmpresa: number;
  tipoDocumentoTrabajador: string;
  numeroDocumentoTrabajador: string;
  tipoBeneficiario: string | null;
  beneficiariosGrupoBorrador?: BeneficiarioGrupoBorradorItem[];
}

/** Respuesta de negocio del WS validar-beneficiario (envuelta en BodyResponse.data). */
export interface ValidarBeneficiarioResponse {
  success?: boolean;
  puedeContinuar?: boolean;
  validaciones?: ValidacionResultAfiliacionInterna[];
  datosFormulario?: DatosFormularioAfiliacionInterna | null;
  error?: string;
  message?: string;
  mensaje?: string;
}
