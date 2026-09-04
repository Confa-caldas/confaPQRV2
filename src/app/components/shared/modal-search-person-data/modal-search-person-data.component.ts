import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Users } from '../../../services/users.service';
import {
  ConsultarPersonaNovedadRespuesta,
  GuardarNovedadCalidadDatosPayload,
  NovedadCalidadDatosOriginalesPayload,
} from '../../../models/users.interface';

export interface DatosPersonaModal {
  numeroRadicado?: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  idPersona?: number;
  idSolicitud?: number;
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  fechaExpedicionDoc?: string | null;
  fechaNacimiento?: string | null;
}

@Component({
  selector: 'app-modal-search-person-data',
  templateUrl: './modal-search-person-data.component.html',
  styleUrl: './modal-search-person-data.component.scss',
})
export class ModalSearchPersonDataComponent implements OnChanges {
  @Input() visible = false;
  @Input() datosPersona: DatosPersonaModal | null = null;

  /** Opcional: notifica al padre tras una consulta exitosa a la API de novedades. */
  @Output() consultar = new EventEmitter<{ tipoDocumento: string; numeroDocumento: string }>();
  @Output() cerrar = new EventEmitter<void>();
  /** Se emite solo tras guardar correctamente en el servicio (el padre puede cerrar o refrescar). */
  @Output() guardarNovedad = new EventEmitter<void>();

  readonly tiposDocumento = [
    { label: 'Cédula extranjería', value: 'CE' },
    { label: 'Permiso de protección temporal', value: 'PPT' },
  ];

  searchForm: FormGroup;
  dataForm: FormGroup;
  /** Copia de solo lectura de lo devuelto por BD (columna izquierda). */
  datosOriginales: DatosPersonaModal | null = null;
  /** Se muestra cuando hay datos (tras consulta al servicio o @Input datosPersona). */
  showDataSection = false;
  consultando = false;
  guardandoNovedad = false;
  /** Valores iniciales de los campos editables tras cargar desde el servicio (para habilitar Guardar solo si hay cambio). */
  private editableReferencia: DatosPersonaModal | null = null;
  /** Sincronizado con el formulario para [disabled] del botón Guardar. */
  tieneCambiosForm = false;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private userService: Users,
    private messageService: MessageService
  ) {
    this.searchForm = this.fb.group({
      tipoDocumento: ['CE'],
      numeroDocumento: [''],
    });
    this.dataForm = this.fb.group({
      primerNombre: [''],
      segundoNombre: [''],
      primerApellido: [''],
      segundoApellido: [''],
      fechaExpedicionDoc: [null as string | null],
      fechaNacimiento: [null as string | null],
    });

    this.dataForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.tieneCambiosForm = this.hayCambiosRespectoCargaInicial();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datosPersona']) {
      if (this.datosPersona) {
        this.datosOriginales = this.normalizarDatosSnapshot(this.datosPersona);
        this.patchDataForm(this.datosOriginales);
        this.showDataSection = true;
      } else if (changes['datosPersona'].previousValue !== undefined) {
        /* Solo limpiar si el padre pasó de tener datos a vaciar (evita borrar resultado de consulta interna). */
        this.datosOriginales = null;
        this.showDataSection = false;
        this.editableReferencia = null;
        this.tieneCambiosForm = false;
      }
    }
    if (changes['visible'] && !this.visible) {
      this.showDataSection = false;
      this.datosOriginales = null;
      this.editableReferencia = null;
      this.tieneCambiosForm = false;
    }
  }

  /** True si el usuario modificó algún campo editable respecto a lo cargado. */
  hayCambiosRespectoCargaInicial(): boolean {
    if (!this.editableReferencia || !this.showDataSection) {
      return false;
    }
    const cur = this.snapshotSoloCamposEditable(this.dataForm.getRawValue() as DatosPersonaModal);
    const ref = this.snapshotSoloCamposEditable(this.editableReferencia);
    return (
      (cur.primerNombre ?? '') !== (ref.primerNombre ?? '') ||
      (cur.segundoNombre ?? '') !== (ref.segundoNombre ?? '') ||
      (cur.primerApellido ?? '') !== (ref.primerApellido ?? '') ||
      (cur.segundoApellido ?? '') !== (ref.segundoApellido ?? '') ||
      (cur.fechaExpedicionDoc ?? null) !== (ref.fechaExpedicionDoc ?? null) ||
      (cur.fechaNacimiento ?? null) !== (ref.fechaNacimiento ?? null)
    );
  }

  private snapshotSoloCamposEditable(d: DatosPersonaModal): DatosPersonaModal {
    return {
      primerNombre: d.primerNombre ?? '',
      segundoNombre: d.segundoNombre ?? '',
      primerApellido: d.primerApellido ?? '',
      segundoApellido: d.segundoApellido ?? '',
      fechaExpedicionDoc: this.normalizarFechaInput(d.fechaExpedicionDoc),
      fechaNacimiento: this.normalizarFechaInput(d.fechaNacimiento),
    };
  }

  private fijarReferenciaEditableDesdeFormulario(): void {
    this.editableReferencia = this.snapshotSoloCamposEditable(
      this.dataForm.getRawValue() as DatosPersonaModal
    );
    this.tieneCambiosForm = false;
  }

  /** Muestra id numérico o guión. */
  textoId(val: number | null | undefined): string {
    return val != null && !Number.isNaN(Number(val)) ? String(val) : '—';
  }

  /** Texto para mostrar en la columna de solo lectura (fechas yyyy-MM-dd o guión). */
  textoCampo(val: string | null | undefined): string {
    const s = val != null && String(val).trim() !== '' ? String(val).trim() : '';
    if (!s) {
      return '—';
    }
    if (s.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(s)) {
      return s.substring(0, 10);
    }
    return s;
  }

  private normalizarFechaInput(s: string | null | undefined): string | null {
    return s && String(s).length >= 10 ? String(s).substring(0, 10) : null;
  }

  private normalizarDatosSnapshot(datos: DatosPersonaModal): DatosPersonaModal {
    return {
      numeroRadicado: datos.numeroRadicado ?? '',
      tipoDocumento: datos.tipoDocumento ?? '',
      numeroDocumento: datos.numeroDocumento ?? '',
      idPersona: datos.idPersona,
      idSolicitud: datos.idSolicitud,
      primerNombre: datos.primerNombre ?? '',
      segundoNombre: datos.segundoNombre ?? '',
      primerApellido: datos.primerApellido ?? '',
      segundoApellido: datos.segundoApellido ?? '',
      fechaExpedicionDoc: this.normalizarFechaInput(datos.fechaExpedicionDoc),
      fechaNacimiento: this.normalizarFechaInput(datos.fechaNacimiento),
    };
  }

  private patchDataForm(datos: DatosPersonaModal): void {
    this.dataForm.patchValue(
      {
        primerNombre: datos.primerNombre ?? '',
        segundoNombre: datos.segundoNombre ?? '',
        primerApellido: datos.primerApellido ?? '',
        segundoApellido: datos.segundoApellido ?? '',
        fechaExpedicionDoc: this.normalizarFechaInput(datos.fechaExpedicionDoc),
        fechaNacimiento: this.normalizarFechaInput(datos.fechaNacimiento),
      },
      { emitEvent: false }
    );
    this.fijarReferenciaEditableDesdeFormulario();
  }

  onConsultar(): void {
    const { tipoDocumento, numeroDocumento } = this.searchForm.getRawValue();
    const doc = String(numeroDocumento || '').trim();
    const tipo = tipoDocumento || 'CE';

    if (!doc) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Ingrese el número de documento.',
      });
      return;
    }

    this.consultando = true;
    this.userService
      .consultarPersonaNovedadCalidadDatos({
        tipo_documento: tipo,
        numero_documento: doc,
      })
      .subscribe({
        next: res => {
          this.consultando = false;
          if (res.code !== 200) {
            this.messageService.add({
              severity: 'error',
              summary: 'Consulta',
              detail: res.message || 'No se pudo obtener la información.',
            });
            return;
          }
          const detalle = this.extraerPrimerRegistro(res.data);
          if (!detalle) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Sin resultados',
              detail: 'No hay registro de novedad para el documento consultado.',
            });
            return;
          }
          const datos = this.normalizarDatosSnapshot(
            this.mapRespuestaApiAModal(detalle, tipo, doc)
          );
          this.datosOriginales = datos;
          this.patchDataForm(datos);
          this.showDataSection = true;
          this.consultar.emit({ tipoDocumento: tipo, numeroDocumento: doc });
        },
        error: () => {
          this.consultando = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se encontraron datos para el documento consultado.',
          });
        },
      });
  }

  private extraerPrimerRegistro(
    data: ConsultarPersonaNovedadRespuesta | ConsultarPersonaNovedadRespuesta[] | null | undefined
  ): ConsultarPersonaNovedadRespuesta | null {
    if (data == null) {
      return null;
    }
    if (Array.isArray(data)) {
      return data.length ? data[0] : null;
    }
    return data;
  }

  /** Mapea la respuesta plana del servicio al modelo del modal. */
  private mapRespuestaApiAModal(
    d: ConsultarPersonaNovedadRespuesta,
    tipoDocumentoConsulta: string,
    numeroDocumentoConsulta: string
  ): DatosPersonaModal {
    return {
      numeroRadicado: d.numero_radicado ?? '',
      tipoDocumento: d.tipo_documento ?? tipoDocumentoConsulta,
      numeroDocumento: d.numero_documento ?? numeroDocumentoConsulta,
      idPersona: d.id_persona,
      idSolicitud: d.id_solicitud,
      primerNombre: d.primer_nombre ?? '',
      segundoNombre: d.segundo_nombre ?? '',
      primerApellido: d.primer_apellido ?? '',
      segundoApellido: d.segundo_apellido ?? '',
      fechaExpedicionDoc: d.fecha_expedicion_doc,
      fechaNacimiento: d.fecha_nacimiento,
    };
  }

  onCerrar(): void {
    this.cerrar.emit();
  }

  onGuardarNovedad(): void {
    const idSolicitud = this.datosOriginales?.idSolicitud;
    const idPersona = this.datosOriginales?.idPersona;
    const numeroRadicado = this.datosOriginales?.numeroRadicado;
    const tipoDocumento = this.datosOriginales?.tipoDocumento;
    const numeroDocumento = this.datosOriginales?.numeroDocumento;
    const ref = this.editableReferencia;

    if (idSolicitud == null || idPersona == null || !ref) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'No hay datos de solicitud o persona para guardar.',
      });
      return;
    }

    const payload = this.construirPayloadGuardarNovedad(
      idSolicitud,
      idPersona,
      numeroRadicado,
      tipoDocumento,
      numeroDocumento,
      ref
    );
    this.guardandoNovedad = true;
    this.userService.guardarNovedadCalidadDatos(payload).subscribe({
      next: res => {
        this.guardandoNovedad = false;
        if (res.code !== 200) {
          this.messageService.add({
            severity: 'error',
            summary: 'Guardar novedad',
            detail: res.message || 'No se pudo guardar la novedad.',
          });
          return;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Novedad guardada',
          detail: 'Los datos se han registrado correctamente.',
        });
        this.guardarNovedad.emit();
      },
      error: () => {
        this.guardandoNovedad = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar la novedad. Intente de nuevo.',
        });
      },
    });
  }

  private construirPayloadGuardarNovedad(
    idSolicitud: number,
    idPersona: number,
    numeroRadicado: string | undefined,
    tipoDocumento: string | undefined,
    numeroDocumento: string | undefined,
    referenciaCarga: DatosPersonaModal
  ): GuardarNovedadCalidadDatosPayload {
    const orig = this.snapshotSoloCamposEditable(referenciaCarga);
    const cur = this.snapshotSoloCamposEditable(this.dataForm.getRawValue() as DatosPersonaModal);

    const datos_originales: NovedadCalidadDatosOriginalesPayload = {
      tipo_documento: tipoDocumento ?? '',
      numero_documento: numeroDocumento ?? '',
      primer_nombre: orig.primerNombre ?? '',
      segundo_nombre: orig.segundoNombre ?? '',
      primer_apellido: orig.primerApellido ?? '',
      segundo_apellido: orig.segundoApellido ?? '',
      fecha_expedicion_doc: orig.fechaExpedicionDoc ?? null,
      fecha_nacimiento: orig.fechaNacimiento ?? null,
    };

    return {
      id_solicitud: idSolicitud,
      id_persona: idPersona,
      numero_radicado: numeroRadicado ?? '',
      datos_originales,
      primer_nombre: this.valorTextoSiCambio(orig.primerNombre, cur.primerNombre),
      segundo_nombre: this.valorTextoSiCambio(orig.segundoNombre, cur.segundoNombre),
      primer_apellido: this.valorTextoSiCambio(orig.primerApellido, cur.primerApellido),
      segundo_apellido: this.valorTextoSiCambio(orig.segundoApellido, cur.segundoApellido),
      fecha_expedicion_doc: this.valorFechaSiCambio(orig.fechaExpedicionDoc, cur.fechaExpedicionDoc),
      fecha_nacimiento: this.valorFechaSiCambio(orig.fechaNacimiento, cur.fechaNacimiento),
    };
  }

  /** Si el texto cambió respecto a la carga, devuelve el valor nuevo; si no, null. */
  private valorTextoSiCambio(original: string | undefined, actual: string | undefined): string | null {
    const o = (original ?? '').trim();
    const a = (actual ?? '').trim();
    return o === a ? null : a;
  }

  /** Si la fecha cambió respecto a la carga, devuelve el valor nuevo (normalizado); si no, null. */
  private valorFechaSiCambio(
    original: string | null | undefined,
    actual: string | null | undefined
  ): string | null {
    const o = this.normalizarFechaInput(original);
    const a = this.normalizarFechaInput(actual);
    return o === a ? null : a;
  }
}
