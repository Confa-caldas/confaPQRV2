import {
  DatosBeneficiarioAfiliacionInterna,
  DatosFormularioAfiliacionInterna,
  PersonalInfoAfiliacionInterna,
} from './validar-trabajador.interface';

export interface DatosPersonaACargoInterna {
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  fechaNacimiento?: string;
  fechaExpedicion?: string;
  genero?: string;
  personaDiscapacidad?: string;
  direccionCorrespondeTrabajador?: string;
  direccion?: string;
}

export interface ValidacionBeneficiarioSnapshotInterna {
  personalInfo?: PersonalInfoAfiliacionInterna;
  form007Data?: DatosFormularioAfiliacionInterna['form007Data'];
  direccionCalculada?: DatosFormularioAfiliacionInterna['direccionCalculada'];
}

export interface DocumentoAdjuntoPersonaACargoInterna {
  idTipoAdjunto: number;
  nombreDocumento: string;
  esRequerido: boolean;
  archivos: File[];
}

/** Beneficiario agregado al listado de la solicitud interna. */
export interface PersonaACargoInterna {
  parentesco: string;
  tipoDocumento: string;
  numeroDocumento: string;
  datosPrecargados?: DatosPersonaACargoInterna;
  datosBeneficiario?: DatosBeneficiarioAfiliacionInterna | null;
  validacionBeneficiario?: ValidacionBeneficiarioSnapshotInterna;
  documentosAdjuntos?: DocumentoAdjuntoPersonaACargoInterna[];
  archivoSoporteDiscapacidad?: File[];
  esPrecargado?: boolean;
}
