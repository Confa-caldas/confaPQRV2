import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';

import {
  DatosEmpresaAfiliacionInterna,
  ValidarEmpresaResponse,
} from '../../../models/afiliacion-interna/validar-empresa.interface';
import {
  EntidadDisponibleAfiliacionInterna,
  LaborInfoAfiliacionInterna,
  MedioPagoAfiliacionInterna,
  PersonalInfoAfiliacionInterna,
  ValidarTrabajadorResponse,
} from '../../../models/afiliacion-interna/validar-trabajador.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import {
  DepartmentList,
  DocumentTypeCompanyList,
  DocumentTypePersonList,
  MunicipalityList,
  Pagination,
  ParametroEstadoCivil,
  ParametroGenero,
} from '../../../models/users.interface';
import { AfiliacionInternaService } from '../../../services/afiliacion-interna.service';
import { Users } from '../../../services/users.service';

/**
 * 0 = selección de modalidad;
 * 1 = consulta empresa (flujo trabajador);
 * 2 = identificación del trabajador;
 * 3 = flujo beneficiario;
 * 4 = solicitud de afiliación (acordeón tras validar trabajador).
 */
export type PasoAfiliacionInterna = 0 | 1 | 2 | 3 | 4;

@Component({
  selector: 'app-create-afiliation-internal',
  templateUrl: './create-afiliation-internal.component.html',
  styleUrl: './create-afiliation-internal.component.scss',
})
export class CreateAfiliationInternalComponent implements OnInit {
  step: PasoAfiliacionInterna = 0;

  consultaEmpresaForm: FormGroup;
  identificacionTrabajadorForm: FormGroup;
  consultaTrabajadorForm: FormGroup;
  /** Formulario principal de la solicitud (pestaña Información personal). */
  solicitudPersonalForm!: FormGroup;
  solicitudLaboralForm!: FormGroup;
  solicitudMedioPagoForm!: FormGroup;

  tiposDocumentoEmpresa: DocumentTypeCompanyList[] = [];
  cargandoTiposDocumentoEmpresa = false;

  tiposDocumentoPersona: { label: string; value: string }[] = [];
  cargandoTiposDocumentoPersona = false;

  validandoEmpresa = false;
  validandoTrabajador = false;

  datosEmpresa: DatosEmpresaAfiliacionInterna | null = null;

  /**
   * ID de empresa devuelto por `validarEmpresa` (`res.data.datosEmpresa.idEmpresa`).
   * Se usa como única fuente para `idEmpresa` en el payload de `validarTrabajador`.
   */
  idEmpresaAfiliacionInterna: number | null = null;

  /** Última respuesta exitosa de `validarTrabajador` (mapeo de acordeón paso 4). */
  respuestaValidarTrabajador: ValidarTrabajadorResponse | null = null;

  /** Acordeón: índices abiertos (`multiple = true`). El tipo incluye `number` por la definición de PrimeNG en `activeIndex`. */
  accordionActiveIndex: number | number[] = [0];

  opcionesGenero: { label: string; value: string }[] = [];
  opcionesEstadoCivil: { label: string; value: string }[] = [];
  opcionesDepartamento: { label: string; value: number }[] = [];
  opcionesMunicipio: { label: string; value: number }[] = [];
  readonly opcionesZona = [
    { label: 'Urbana', value: 'Urbana' },
    { label: 'Rural', value: 'Rural' },
  ];

  private catalogosSolicitudCargados = false;
  private municipiosCache: MunicipalityList[] = [];

  empresasDemo = [
    { label: 'Empresa (demo) 1', value: '1' },
    { label: 'Empresa (demo) 2', value: '2' },
  ];

  consultaTrabajadorEjecutada = false;

  opcionesMedioPago: { label: string; value: string }[] = [
    { label: 'Efectivo', value: 'Efectivo' },
    { label: 'Transferencia bancaria', value: 'Transferencia bancaria' },
  ];
  opcionesEntidadesPago: { label: string; value: number }[] = [];
  opcionesTipoCuenta: { label: string; value: number }[] = [];

  laborFechaIngresoMin: Date | null = null;
  laborFechaIngresoMax: Date | null = null;
  horasLaboralesMin = 1;
  horasLaboralesMax = 240;
  salarioMinimoRef: number | null = null;

  private entidadesMedioPagoRef: EntidadDisponibleAfiliacionInterna[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly title: Title,
    private readonly users: Users,
    private readonly afiliacionInterna: AfiliacionInternaService,
    private readonly messageService: MessageService
  ) {
    this.consultaEmpresaForm = this.fb.group({
      tipo_documento: [null as number | null, Validators.required],
      numero_documento: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
    });

    this.identificacionTrabajadorForm = this.fb.group({
      tipo_documento: [null, Validators.required],
      numero_documento: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
    });

    this.consultaTrabajadorForm = this.fb.group({
      tipo_documento: [null, Validators.required],
      numero_documento: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      empresa_id: [{ value: null, disabled: true }],
    });

    this.solicitudPersonalForm = this.fb.group(
      {
        tipo_documento: [''],
        numero_documento: [''],
        primer_nombre: ['', Validators.required],
        segundo_nombre: [''],
        primer_apellido: ['', Validators.required],
        segundo_apellido: [''],
        fecha_nacimiento: [null as Date | null, Validators.required],
        fecha_expedicion: [null as Date | null, Validators.required],
        celular: ['', [Validators.required, Validators.pattern(/^[36]\d{9}$/)]],
        confirmar_celular: ['', [Validators.required, Validators.pattern(/^[36]\d{9}$/)]],
        correo: ['', [Validators.required, Validators.email]],
        confirmar_correo: ['', [Validators.required, Validators.email]],
        genero: [null as string | null, Validators.required],
        estado_civil: [null as string | null, Validators.required],
        direccion: ['', Validators.required],
        zona: [null as string | null, Validators.required],
        id_departamento: [null as number | null, Validators.required],
        id_municipio: [null as number | null, Validators.required],
      },
      { validators: [CreateAfiliationInternalComponent.confirmacionesContactoCoinciden] }
    );

    this.solicitudLaboralForm = this.fb.group({
      fecha_ingreso_empresa: [null as Date | null, Validators.required],
      horas_mes: [null as number | null, [Validators.required, Validators.min(1), Validators.max(240)]],
      salario_mensual: [null as number | null, Validators.required],
      cargo_desempenado: [''],
    });

    this.solicitudMedioPagoForm = this.fb.group({
      medio_pago: [''],
      id_entidad: [null as number | null],
      tipo_cuenta: [null as number | null],
      numero_cuenta: [''],
      confirmacion_cuenta: [''],
      llave_breb: [''],
      confirmar_llave_breb: [''],
    });

    this.solicitudPersonalForm.get('id_departamento')?.valueChanges.subscribe(id => {
      this.solicitudPersonalForm.get('id_municipio')?.setValue(null, { emitEvent: false });
      this.cargarMunicipiosPorDepartamento(id);
    });

    this.solicitudMedioPagoForm.get('id_entidad')?.valueChanges.subscribe(id => {
      this.actualizarTiposCuentaPorEntidad(id as number | null, null);
    });
  }

  private static confirmacionesContactoCoinciden(group: AbstractControl): ValidationErrors | null {
    const g = group as FormGroup;
    const cel = (g.get('celular')?.value ?? '').toString().trim();
    const celC = (g.get('confirmar_celular')?.value ?? '').toString().trim();
    const mail = (g.get('correo')?.value ?? '').toString().trim();
    const mailC = (g.get('confirmar_correo')?.value ?? '').toString().trim();
    const err: ValidationErrors = {};
    if (cel !== celC) {
      err['confirmarCelular'] = true;
    }
    if (mail !== mailC) {
      err['confirmarCorreo'] = true;
    }
    return Object.keys(err).length ? err : null;
  }

  ngOnInit(): void {
    this.title.setTitle('Solicitud interna');
    this.cargarTiposDocumentoEmpresa();
    this.cargarTiposDocumentoPersona();
  }

  private cargarTiposDocumentoEmpresa(): void {
    this.cargandoTiposDocumentoEmpresa = true;
    const payload: Pagination = { page: 1, page_size: 500 };
    this.users.getDocumentoTypeCompanyListPagination(payload).subscribe({
      next: (response: BodyResponse<DocumentTypeCompanyList[]>) => {
        this.cargandoTiposDocumentoEmpresa = false;
        if (response.code === 200 && Array.isArray(response.data)) {
          this.tiposDocumentoEmpresa = response.data.filter(
            row => row.esta_activo !== false && row.id != null && (row.tipo_documento || '').trim() !== ''
          );
        } else {
          this.tiposDocumentoEmpresa = [];
          console.warn('[Solicitud interna] Tipos documento empresa no disponibles:', response.message);
        }
      },
      error: (err: unknown) => {
        this.cargandoTiposDocumentoEmpresa = false;
        this.tiposDocumentoEmpresa = [];
        console.error('[Solicitud interna] Error al cargar tipos documento empresa', err);
      },
    });
  }

  private cargarTiposDocumentoPersona(): void {
    this.cargandoTiposDocumentoPersona = true;
    const payload: Pagination = { page: 1, page_size: 500 };
    this.users.getDocumentoTypePersonListPagination(payload).subscribe({
      next: (response: BodyResponse<DocumentTypePersonList[]>) => {
        this.cargandoTiposDocumentoPersona = false;
        if (response.code === 200 && Array.isArray(response.data)) {
          this.tiposDocumentoPersona = response.data
            .filter(row => row.esta_activo !== false && (row.tipo_documento || '').trim() !== '')
            .map(row => ({
              label: (row.tipo_documento || '').trim(),
              /** Valor enviado en payloads: preferir texto de catálogo `tipo_documento` sobre `tipo_documento_genesys`. */
              value:
                (row.tipo_documento && String(row.tipo_documento).trim()) ||
                (row.tipo_documento_genesys && String(row.tipo_documento_genesys).trim()) ||
                '',
            }))
            .filter(o => o.value !== '');
        } else {
          this.tiposDocumentoPersona = [];
          console.warn('[Solicitud interna] Tipos documento persona no disponibles:', response.message);
        }
      },
      error: (err: unknown) => {
        this.cargandoTiposDocumentoPersona = false;
        this.tiposDocumentoPersona = [];
        console.error('[Solicitud interna] Error al cargar tipos documento persona', err);
      },
    });
  }

  irTrabajador(): void {
    this.step = 1;
    this.datosEmpresa = null;
    this.idEmpresaAfiliacionInterna = null;
    this.reiniciarConsultaEmpresa();
    this.reiniciarIdentificacionTrabajador();
    this.limpiarSolicitudInterna();
  }

  irBeneficiario(): void {
    this.step = 3;
    this.datosEmpresa = null;
    this.idEmpresaAfiliacionInterna = null;
    this.reiniciarConsultaEmpresa();
    this.reiniciarIdentificacionTrabajador();
    this.reiniciarConsultaTrabajador();
    this.limpiarSolicitudInterna();
  }

  volverSeleccion(): void {
    this.step = 0;
    this.datosEmpresa = null;
    this.idEmpresaAfiliacionInterna = null;
    this.reiniciarConsultaEmpresa();
    this.reiniciarIdentificacionTrabajador();
    this.reiniciarConsultaTrabajador();
    this.limpiarSolicitudInterna();
  }

  regresarAConsultaEmpresa(): void {
    this.step = 1;
    this.datosEmpresa = null;
    this.idEmpresaAfiliacionInterna = null;
    this.reiniciarConsultaEmpresa();
    this.reiniciarIdentificacionTrabajador();
    this.limpiarSolicitudInterna();
  }

  get razonSocialEmpresa(): string {
    const d = this.datosEmpresa;
    if (!d) {
      return '';
    }
    const raw =
      d.razonSocial ??
      d['razon_social'] ??
      d['RazonSocial'] ??
      d['razonSocialEmpresa'] ??
      '';
    const s = String(raw).trim();
    return s || '—';
  }

  private normalizarIdEmpresa(raw: unknown): number | null {
    if (raw === undefined || raw === null || raw === '') {
      return null;
    }
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  private reiniciarConsultaEmpresa(): void {
    this.consultaEmpresaForm.reset({
      tipo_documento: null,
      numero_documento: '',
    });
  }

  private reiniciarIdentificacionTrabajador(): void {
    this.identificacionTrabajadorForm.reset({
      tipo_documento: null,
      numero_documento: '',
    });
  }

  private reiniciarConsultaTrabajador(): void {
    this.consultaTrabajadorEjecutada = false;
    this.consultaTrabajadorForm.reset({
      tipo_documento: null,
      numero_documento: '',
      empresa_id: null,
    });
    const emp = this.consultaTrabajadorForm.get('empresa_id');
    emp?.clearValidators();
    emp?.disable();
    emp?.updateValueAndValidity();
  }

  private limpiarSolicitudInterna(): void {
    this.respuestaValidarTrabajador = null;
    this.accordionActiveIndex = [0];
    this.catalogosSolicitudCargados = false;
    this.opcionesMunicipio = [];
    this.municipiosCache = [];
    this.solicitudPersonalForm.reset(
      {
        tipo_documento: '',
        numero_documento: '',
        primer_nombre: '',
        segundo_nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        fecha_nacimiento: null,
        fecha_expedicion: null,
        celular: '',
        confirmar_celular: '',
        correo: '',
        confirmar_correo: '',
        genero: null,
        estado_civil: null,
        direccion: '',
        zona: null,
        id_departamento: null,
        id_municipio: null,
      },
      { emitEvent: false }
    );
    this.solicitudPersonalForm.enable({ emitEvent: false });
    this.reiniciarFormulariosLaboralYMedioPago();
  }

  /** Limpia solo el estado del paso 4 al salir de la solicitud hacia paso 2. */
  private resetPasoSolicitudManteniendoPaso(paso: PasoAfiliacionInterna): void {
    this.step = paso;
    this.respuestaValidarTrabajador = null;
    this.accordionActiveIndex = [0];
    this.catalogosSolicitudCargados = false;
    this.opcionesMunicipio = [];
    this.municipiosCache = [];
    this.solicitudPersonalForm.reset(
      {
        tipo_documento: '',
        numero_documento: '',
        primer_nombre: '',
        segundo_nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        fecha_nacimiento: null,
        fecha_expedicion: null,
        celular: '',
        confirmar_celular: '',
        correo: '',
        confirmar_correo: '',
        genero: null,
        estado_civil: null,
        direccion: '',
        zona: null,
        id_departamento: null,
        id_municipio: null,
      },
      { emitEvent: false }
    );
    this.solicitudPersonalForm.enable({ emitEvent: false });
    this.reiniciarFormulariosLaboralYMedioPago();
  }

  private reiniciarFormulariosLaboralYMedioPago(): void {
    this.entidadesMedioPagoRef = [];
    this.opcionesEntidadesPago = [];
    this.opcionesTipoCuenta = [];
    this.opcionesMedioPago = [
      { label: 'Efectivo', value: 'Efectivo' },
      { label: 'Transferencia bancaria', value: 'Transferencia bancaria' },
    ];
    this.laborFechaIngresoMin = null;
    this.laborFechaIngresoMax = null;
    this.horasLaboralesMin = 1;
    this.horasLaboralesMax = 240;
    this.salarioMinimoRef = null;
    this.solicitudLaboralForm.reset(
      {
        fecha_ingreso_empresa: null,
        horas_mes: null,
        salario_mensual: null,
        cargo_desempenado: '',
      },
      { emitEvent: false }
    );
    this.solicitudLaboralForm.get('horas_mes')?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(240),
    ]);
    this.solicitudLaboralForm.get('salario_mensual')?.setValidators([Validators.required]);
    this.solicitudLaboralForm.updateValueAndValidity({ emitEvent: false });
    this.solicitudMedioPagoForm.reset(
      {
        medio_pago: '',
        id_entidad: null,
        tipo_cuenta: null,
        numero_cuenta: '',
        confirmacion_cuenta: '',
        llave_breb: '',
        confirmar_llave_breb: '',
      },
      { emitEvent: false }
    );
    this.solicitudLaboralForm.enable({ emitEvent: false });
    this.solicitudMedioPagoForm.enable({ emitEvent: false });
  }

  consultarEmpresa(): void {
    this.consultaEmpresaForm.markAllAsTouched();
    if (this.consultaEmpresaForm.invalid || this.validandoEmpresa) {
      return;
    }
    const raw = this.consultaEmpresaForm.getRawValue() as {
      tipo_documento: number | null;
      numero_documento: string;
    };
    const row = this.tiposDocumentoEmpresa.find(t => t.id === raw.tipo_documento);
    const tipoDoc =
      (row?.tipo_documento && String(row.tipo_documento).trim()) ||
      (row?.tipo_documento_genesys && String(row.tipo_documento_genesys).trim()) ||
      String(raw.tipo_documento ?? '');
    const numDoc = String(raw.numero_documento ?? '').trim();

    this.idEmpresaAfiliacionInterna = null;
    this.validandoEmpresa = true;
    this.afiliacionInterna
      .validarEmpresa(tipoDoc, numDoc)
      .pipe(finalize(() => (this.validandoEmpresa = false)))
      .subscribe({
        next: (res: BodyResponse<ValidarEmpresaResponse>) => {
          if (res.code !== 200) {
            this.messageService.add({
              severity: 'error',
              summary: 'Validación de empresa',
              detail: res.message || 'No se pudo validar la empresa.',
            });
            return;
          }
          const payload = res.data;
          if (!payload) {
            this.messageService.add({
              severity: 'error',
              summary: 'Validación de empresa',
              detail: res.message || 'Respuesta incompleta del servicio.',
            });
            return;
          }
          if (payload.puedeContinuar) {
            this.datosEmpresa = payload.datosEmpresa ?? null;
            this.idEmpresaAfiliacionInterna = this.normalizarIdEmpresa(
              payload.datosEmpresa?.idEmpresa ?? payload.datosEmpresa?.id_empresa
            );
            this.reiniciarIdentificacionTrabajador();
            this.step = 2;
            return;
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Empresa no apta',
            detail:
              payload.mensaje ||
              res.message ||
              'La empresa no cumple los requisitos para continuar con la solicitud.',
          });
        },
        error: (err: { error?: { message?: string }; message?: string }) => {
          const detail =
            err?.error?.message || err?.message || 'Error de comunicación al validar la empresa.';
          this.messageService.add({
            severity: 'error',
            summary: 'Validación de empresa',
            detail,
          });
        },
      });
  }

  consultarIdentificacionTrabajador(): void {
    this.identificacionTrabajadorForm.markAllAsTouched();
    if (this.identificacionTrabajadorForm.invalid || this.validandoTrabajador) {
      return;
    }
    const idEmpresa = this.idEmpresaAfiliacionInterna;
    if (idEmpresa == null) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validación de trabajador',
        detail:
          'No se encontró el identificador de la empresa (idEmpresa). Vuelva a validar la empresa o contacte a soporte.',
      });
      return;
    }
    const tipoDocumento = String(this.identificacionTrabajadorForm.get('tipo_documento')?.value ?? '');
    const numeroDocumento = String(this.identificacionTrabajadorForm.get('numero_documento')?.value ?? '').trim();

    this.validandoTrabajador = true;
    this.afiliacionInterna
      .validarTrabajador({
        tipoDocumento,
        numeroDocumento,
        idEmpresa,
      })
      .pipe(finalize(() => (this.validandoTrabajador = false)))
      .subscribe({
        next: (res: BodyResponse<ValidarTrabajadorResponse>) => {
          if (res.code !== 200) {
            this.messageService.add({
              severity: 'error',
              summary: 'Validación de trabajador',
              detail: res.message || 'No se pudo validar al trabajador.',
            });
            return;
          }
          const data = res.data;
          if (!data) {
            this.messageService.add({
              severity: 'error',
              summary: 'Validación de trabajador',
              detail: res.message || 'Respuesta incompleta del servicio.',
            });
            return;
          }
          if (data.puedeContinuar === false) {
            this.messageService.add({
              severity: 'error',
              summary: 'Validación de trabajador',
              detail: data.mensaje || 'El trabajador no puede continuar con la solicitud.',
            });
            return;
          }
          this.respuestaValidarTrabajador = data;
          this.patchSolicitudDesdeRespuesta(data);
          this.patchLaborDesdeRespuesta(data);
          this.patchMedioPagoDesdeRespuesta(data);
          this.cargarCatalogosSolicitud();
          this.accordionActiveIndex = [0];
          this.step = 4;
        },
        error: (err: { error?: { message?: string }; message?: string }) => {
          const detail =
            err?.error?.message || err?.message || 'Error de comunicación al validar al trabajador.';
          this.messageService.add({
            severity: 'error',
            summary: 'Validación de trabajador',
            detail,
          });
        },
      });
  }

  regresarDesdeSolicitudTrabajador(): void {
    this.resetPasoSolicitudManteniendoPaso(2);
  }

  guardarYContinuarInformacionPersonal(): void {
    this.solicitudPersonalForm.markAllAsTouched();
    this.solicitudPersonalForm.updateValueAndValidity();
    if (this.solicitudPersonalForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Información personal',
        detail: 'Complete los campos obligatorios y verifique que celular y correo coincidan con su confirmación.',
      });
      return;
    }
    this.accordionActiveIndex = [0, 1];
    this.messageService.add({
      severity: 'success',
      summary: 'Información personal',
      detail: 'Datos guardados. Continúe con información laboral.',
    });
  }

  guardarYContinuarInformacionLaboral(): void {
    this.solicitudLaboralForm.markAllAsTouched();
    this.solicitudLaboralForm.updateValueAndValidity();
    if (this.solicitudLaboralForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Información laboral',
        detail: 'Complete los campos obligatorios y revise fechas, horas y salario según los límites indicados.',
      });
      return;
    }
    this.accordionActiveIndex = [0, 1, 2];
    this.messageService.add({
      severity: 'success',
      summary: 'Información laboral',
      detail: 'Datos guardados. Continúe con medio de pago.',
    });
  }

  guardarYContinuarMedioPago(): void {
    this.solicitudMedioPagoForm.markAllAsTouched();
    this.accordionActiveIndex = [0, 1, 2, 3];
    this.messageService.add({
      severity: 'success',
      summary: 'Medio de pago',
      detail: 'Datos registrados. Revise beneficiarios si aplica.',
    });
  }

  regresarDesdeInformacionLaboral(): void {
    this.accordionActiveIndex = [0];
  }

  regresarDesdeMedioPago(): void {
    this.accordionActiveIndex = [0, 1];
  }

  regresarDesdeBeneficiarios(): void {
    this.accordionActiveIndex = [0, 1, 2];
  }

  guardarSolicitudGlobal(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Solicitud',
      detail: 'La acción de guardar solicitud se integrará con el backend en un siguiente paso.',
    });
  }

  regresarGlobalDesdeSolicitud(): void {
    this.regresarDesdeSolicitudTrabajador();
  }

  consultarTrabajador(): void {
    this.consultaTrabajadorForm.markAllAsTouched();
    if (this.consultaTrabajadorForm.invalid) {
      return;
    }
    console.log('[Solicitud interna] Consultar trabajador', this.consultaTrabajadorForm.getRawValue());
    this.consultaTrabajadorEjecutada = true;
    const emp = this.consultaTrabajadorForm.get('empresa_id');
    emp?.setValidators([Validators.required]);
    emp?.enable();
    emp?.updateValueAndValidity();
  }

  get puedeMostrarAgregarBeneficiario(): boolean {
    return (
      this.consultaTrabajadorEjecutada &&
      this.consultaTrabajadorForm.get('empresa_id')?.enabled === true &&
      this.consultaTrabajadorForm.get('empresa_id')?.value != null &&
      this.consultaTrabajadorForm.get('empresa_id')?.value !== ''
    );
  }

  get beneficiariosPrecargarLista(): unknown[] {
    const raw = this.respuestaValidarTrabajador?.datosFormulario?.beneficiariosPrecargar;
    return Array.isArray(raw) ? raw : [];
  }

  get datosBeneficiarioPrecarga(): unknown | null {
    return this.respuestaValidarTrabajador?.datosFormulario?.datosBeneficiario ?? null;
  }

  get mostrarFormularioMedioPago(): boolean {
    return this.respuestaValidarTrabajador?.datosFormulario?.medioPago?.mostrarCamposFormulario !== false;
  }

  get mensajeInformativoMedioPago(): string {
    return String(this.respuestaValidarTrabajador?.datosFormulario?.medioPago?.mensajeInformativo ?? '').trim();
  }

  agregarBeneficiario(): void {
    if (!this.puedeMostrarAgregarBeneficiario) {
      return;
    }
    console.log('[Solicitud interna] Agregar beneficiario (placeholder)', {
      ...this.consultaTrabajadorForm.getRawValue(),
    });
  }

  private patchSolicitudDesdeRespuesta(resp: ValidarTrabajadorResponse): void {
    this.solicitudPersonalForm.enable({ emitEvent: false });
    const pi = resp.datosFormulario?.personalInfo;
    const pick = (src: PersonalInfoAfiliacionInterna | null | undefined, ...keys: string[]): string | null => {
      if (!src) {
        return null;
      }
      for (const k of keys) {
        const v = src[k];
        if (v !== undefined && v !== null && String(v).trim() !== '') {
          return String(v).trim();
        }
      }
      return null;
    };

    const tipoDoc =
      pick(pi, 'tipo_documento', 'tipoDocumento') ??
      String(this.identificacionTrabajadorForm.get('tipo_documento')?.value ?? '');
    const numDoc =
      pick(pi, 'numero_documento', 'numeroDocumento') ??
      String(this.identificacionTrabajadorForm.get('numero_documento')?.value ?? '');

    const deptoNombre =
      pick(pi, 'departamento_residencia', 'departamento') ?? pick(pi, 'nombre_departamento', 'nombreDepartamento');
    const muniNombre =
      pick(pi, 'municipio_residencia', 'municipio', 'ciudad') ??
      pick(pi, 'nombre_municipio', 'nombreMunicipio');

    const tel = pick(pi, 'celular', 'telefono');
    const correoRaw =
      pick(pi, 'correo', 'correo_electronico', 'correoElectronico') ?? '';
    const correoNorm = correoRaw ? correoRaw.toLowerCase() : '';

    const patch: Record<string, unknown> = {
      tipo_documento: tipoDoc,
      numero_documento: numDoc,
      primer_nombre: pick(pi, 'primer_nombre', 'primerNombre') ?? '',
      segundo_nombre: pick(pi, 'segundo_nombre', 'segundoNombre') ?? '',
      primer_apellido: pick(pi, 'primer_apellido', 'primerApellido') ?? '',
      segundo_apellido: pick(pi, 'segundo_apellido', 'segundoApellido') ?? '',
      fecha_nacimiento: this.parseFechaString(
        pick(pi, 'fecha_nacimiento', 'fechaNacimiento', 'fecha_nacimiento_str')
      ),
      fecha_expedicion: this.parseFechaString(
        pick(pi, 'fecha_expedicion_doc', 'fechaExpedicion', 'fecha_expedicion')
      ),
      celular: tel ?? '',
      confirmar_celular: pick(pi, 'confirmar_celular', 'confirmarCelular') ?? tel ?? '',
      correo: correoNorm,
      confirmar_correo: (() => {
        const c = pick(pi, 'confirmar_correo', 'confirmarCorreo');
        if (c != null && String(c).trim() !== '') {
          return String(c).trim().toLowerCase();
        }
        return correoNorm;
      })(),
      genero: pick(pi, 'genero') ?? null,
      estado_civil: pick(pi, 'estado_civil', 'estadoCivil') ?? null,
      direccion: pick(pi, 'direccion', 'direccion_residencia', 'direccionResidencia') ?? '',
      zona: pick(pi, 'zona') ?? null,
      id_departamento: null as number | null,
      id_municipio: null as number | null,
    };

    this.solicitudPersonalForm.patchValue(patch, { emitEvent: false });

    this.opcionesDepartamento = [];
    this.users.getDepartmentList().subscribe({
      next: (out: BodyResponse<DepartmentList[]>) => {
        if (out.code === 200 && Array.isArray(out.data)) {
          this.opcionesDepartamento = out.data
            .filter(d => d.esta_activo !== false && d.id != null)
            .map(d => ({ label: (d.nombre_departamento || '').trim(), value: Number(d.id) }));

          let deptId: number | null = null;
          if (deptoNombre) {
            const found = this.opcionesDepartamento.find(
              o => o.label.toLowerCase() === deptoNombre.toLowerCase()
            );
            deptId = found?.value ?? null;
          }
          this.solicitudPersonalForm.patchValue({ id_departamento: deptId }, { emitEvent: false });
          if (deptId != null && muniNombre) {
            this.resolverMunicipioTrasCargar(deptId, muniNombre);
          } else if (deptId != null) {
            this.cargarMunicipiosPorDepartamento(deptId);
          }
        }
      },
      error: () => {},
    });

    this.solicitudPersonalForm.disable({ emitEvent: false });
  }

  private resolverMunicipioTrasCargar(idDepartamento: number, muniNombre: string): void {
    const payload: Pagination = { page: 1, page_size: 2000 };
    this.users.getMunicipalityListPagination(payload).subscribe({
      next: (res: BodyResponse<MunicipalityList[]>) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          this.municipiosCache = res.data;
          const list = res.data.filter(m => m.id_departamento === idDepartamento && m.esta_activo !== false);
          this.opcionesMunicipio = list
            .filter(m => m.id != null)
            .map(m => ({ label: (m.nombre_municipio || '').trim(), value: m.id as number }));
          const found = this.opcionesMunicipio.find(
            o => o.label.toLowerCase() === muniNombre.toLowerCase()
          );
          if (found) {
            this.solicitudPersonalForm.patchValue({ id_municipio: found.value }, { emitEvent: false });
          }
        }
      },
      error: () => {},
    });
  }

  private patchLaborDesdeRespuesta(resp: ValidarTrabajadorResponse): void {
    const li = resp.datosFormulario?.laborInfo as LaborInfoAfiliacionInterna | null | undefined;
    const pi = resp.datosFormulario?.personalInfo;
    const cargoRaw = pi?.cargoOficio ?? pi?.cargo_oficio;
    const cargoStr =
      cargoRaw != null && String(cargoRaw).trim() !== '' ? String(cargoRaw).trim() : '';

    if (!li) {
      this.laborFechaIngresoMin = null;
      this.laborFechaIngresoMax = null;
      this.horasLaboralesMin = 1;
      this.horasLaboralesMax = 240;
      this.salarioMinimoRef = null;
      this.solicitudLaboralForm.patchValue(
        {
          fecha_ingreso_empresa: null,
          horas_mes: null,
          salario_mensual: null,
          cargo_desempenado: cargoStr,
        },
        { emitEvent: false }
      );
      return;
    }

    this.laborFechaIngresoMin = this.parseFechaString(li.rangoFechaIngreso?.fechaMinima ?? null);
    this.laborFechaIngresoMax = this.parseFechaString(li.rangoFechaIngreso?.fechaMaxima ?? null);
    this.horasLaboralesMin = li.horasMinimas != null ? Number(li.horasMinimas) : 1;
    this.horasLaboralesMax = li.horasMaximas != null ? Number(li.horasMaximas) : 240;
    this.salarioMinimoRef = li.salarioMinimo != null ? Number(li.salarioMinimo) : null;

    const salMin = this.salarioMinimoRef ?? 0;
    const horasDefault =
      li.horasMaximas != null && !Number.isNaN(Number(li.horasMaximas))
        ? Number(li.horasMaximas)
        : null;
    const salarioVal =
      li.salarioActual != null && !Number.isNaN(Number(li.salarioActual)) ? Number(li.salarioActual) : null;

    this.solicitudLaboralForm.patchValue(
      {
        fecha_ingreso_empresa: null,
        horas_mes: horasDefault,
        salario_mensual: salarioVal,
        cargo_desempenado: cargoStr,
      },
      { emitEvent: false }
    );

    this.solicitudLaboralForm.get('horas_mes')?.setValidators([
      Validators.required,
      Validators.min(this.horasLaboralesMin),
      Validators.max(this.horasLaboralesMax),
    ]);
    this.solicitudLaboralForm.get('salario_mensual')?.setValidators([
      Validators.required,
      Validators.min(salMin > 0 ? salMin : 0),
    ]);
    this.solicitudLaboralForm.updateValueAndValidity({ emitEvent: false });
  }

  private patchMedioPagoDesdeRespuesta(resp: ValidarTrabajadorResponse): void {
    const mp = resp.datosFormulario?.medioPago as MedioPagoAfiliacionInterna | null | undefined;
    this.entidadesMedioPagoRef = Array.isArray(mp?.entidadesDisponibles) ? mp!.entidadesDisponibles! : [];
    this.opcionesEntidadesPago = this.entidadesMedioPagoRef
      .filter(e => e?.idEntidad != null)
      .map(e => ({
        label: (e.nombreEntidad || '').trim(),
        value: Number(e.idEntidad),
      }));

    if (!mp || mp.mostrarCamposFormulario === false) {
      this.solicitudMedioPagoForm.reset(
        {
          medio_pago: '',
          id_entidad: null,
          tipo_cuenta: null,
          numero_cuenta: '',
          confirmacion_cuenta: '',
          llave_breb: '',
          confirmar_llave_breb: '',
        },
        { emitEvent: false }
      );
      this.opcionesTipoCuenta = [];
      return;
    }

    const medio = (mp.medioPago ?? '').trim();
    this.asegurarOpcionMedioPagoEnCatalogo(medio);

    const idBanco =
      mp.banco != null && String(mp.banco).trim() !== ''
        ? Number(mp.banco)
        : mp.entidadBancaria != null && String(mp.entidadBancaria).trim() !== ''
          ? Number(mp.entidadBancaria)
          : null;

    const idTipo =
      mp.tipoCuenta != null && String(mp.tipoCuenta).trim() !== '' ? Number(mp.tipoCuenta) : null;

    this.solicitudMedioPagoForm.patchValue(
      {
        medio_pago: medio,
        id_entidad: idBanco != null && !Number.isNaN(idBanco) ? idBanco : null,
        tipo_cuenta: idTipo != null && !Number.isNaN(idTipo) ? idTipo : null,
        numero_cuenta: mp.numeroCuenta != null ? String(mp.numeroCuenta) : '',
        confirmacion_cuenta: mp.confirmacionCuenta != null ? String(mp.confirmacionCuenta) : '',
        llave_breb: '',
        confirmar_llave_breb: '',
      },
      { emitEvent: false }
    );

    this.actualizarTiposCuentaPorEntidad(
      idBanco != null && !Number.isNaN(idBanco) ? idBanco : null,
      idTipo != null && !Number.isNaN(idTipo) ? idTipo : null
    );
  }

  private asegurarOpcionMedioPagoEnCatalogo(val: string | null | undefined): void {
    const v = (val ?? '').trim();
    if (!v) {
      return;
    }
    if (!this.opcionesMedioPago.some(o => o.value === v)) {
      this.opcionesMedioPago = [...this.opcionesMedioPago, { label: v, value: v }];
    }
  }

  private actualizarTiposCuentaPorEntidad(
    idEntidad: number | null,
    tipoPreferido: number | null = null
  ): void {
    this.solicitudMedioPagoForm.get('tipo_cuenta')?.setValue(null, { emitEvent: false });
    if (idEntidad == null) {
      this.opcionesTipoCuenta = [];
      return;
    }
    const ent = this.entidadesMedioPagoRef.find(e => Number(e.idEntidad) === Number(idEntidad));
    if (!ent?.tiposCuenta?.length) {
      this.opcionesTipoCuenta = [];
      return;
    }
    this.opcionesTipoCuenta = ent.tiposCuenta
      .filter(t => t?.idTipoCuenta != null)
      .map(t => ({
        label: (t.nombreTipoCuenta || '').trim() || 'Tipo de cuenta',
        value: Number(t.idTipoCuenta),
      }));
    if (
      tipoPreferido != null &&
      !Number.isNaN(tipoPreferido) &&
      this.opcionesTipoCuenta.some(o => o.value === tipoPreferido)
    ) {
      this.solicitudMedioPagoForm.get('tipo_cuenta')?.setValue(tipoPreferido, { emitEvent: false });
    }
  }

  private parseFechaString(s: string | null | undefined): Date | null {
    if (s == null || String(s).trim() === '') {
      return null;
    }
    const str = String(s).trim();
    const dmY = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmY) {
      const d = +dmY[1];
      const m = +dmY[2] - 1;
      const y = +dmY[3];
      const dt = new Date(y, m, d);
      return isNaN(dt.getTime()) ? null : dt;
    }
    const iso = new Date(str);
    return isNaN(iso.getTime()) ? null : iso;
  }

  private cargarCatalogosSolicitud(): void {
    if (this.catalogosSolicitudCargados) {
      return;
    }
    let pend = 2;
    const done = () => {
      pend--;
      if (pend <= 0) {
        this.catalogosSolicitudCargados = true;
      }
    };

    this.users.getGeneroList().subscribe({
      next: (res: BodyResponse<ParametroGenero[]>) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          this.opcionesGenero = res.data
            .filter(g => g.esta_activo !== false)
            .map(g => ({ label: (g.genero || '').trim(), value: (g.genero || '').trim() }));
        }
        done();
      },
      error: () => done(),
    });

    this.users.getEstadoCivilList().subscribe({
      next: (res: BodyResponse<ParametroEstadoCivil[]>) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          this.opcionesEstadoCivil = res.data
            .filter(e => e.esta_activo !== false)
            .map(e => ({ label: (e.estado_civil || '').trim(), value: (e.estado_civil || '').trim() }));
        }
        done();
      },
      error: () => done(),
    });
  }

  private cargarMunicipiosPorDepartamento(idDepartamento: number | null): void {
    if (idDepartamento == null) {
      this.opcionesMunicipio = [];
      return;
    }
    const run = (all: MunicipalityList[]) => {
      const list = all.filter(m => m.id_departamento === idDepartamento && m.esta_activo !== false);
      this.opcionesMunicipio = list
        .filter(m => m.id != null)
        .map(m => ({ label: (m.nombre_municipio || '').trim(), value: m.id as number }));
    };
    if (this.municipiosCache.length > 0) {
      run(this.municipiosCache);
      return;
    }
    const payload: Pagination = { page: 1, page_size: 2000 };
    this.users.getMunicipalityListPagination(payload).subscribe({
      next: (res: BodyResponse<MunicipalityList[]>) => {
        if (res.code === 200 && Array.isArray(res.data)) {
          this.municipiosCache = res.data;
          run(res.data);
        }
      },
      error: () => {
        this.opcionesMunicipio = [];
      },
    });
  }
}
