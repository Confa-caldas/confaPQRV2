import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  AfiliacionFiltroIndicadorGestion,
  ApplicantTypeList,
  afiliacionColumnaTextoIndicadoresSi,
  afiliacionIndicadoresPermitenAsignar,
  FilterRequestsMassive,
  mensajeTooltipAsignarAfiliacionPorFila,
  MENSAJE_TOOLTIP_ASIGNAR_AFILIACION_INHABILITADA,
  RequestStatusAfiliationList,
  RequestTypeList,
  RequestsListAfiliation,
  RequestsMassiveAfiliationListItem,
  UserList,
} from '../../../models/users.interface';
import { RoutesApp } from '../../../enums/routes.enum';
import { MessageService } from 'primeng/api';
import { formatDate } from '@angular/common';
import { SessionStorageItems } from '../../../enums/session-storage-items.enum';
import { FormControl, FormGroup } from '@angular/forms';
import { PaginatorState } from 'primeng/paginator';
import { forkJoin } from 'rxjs';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-search-request-afi-massive',
  templateUrl: './search-request-afi-massive.component.html',
  styleUrl: './search-request-afi-massive.component.scss',
})
export class SearchRequestAfiMassiveComponent implements OnInit {
  readonly mensajeTooltipAsignarInhabilitada = MENSAJE_TOOLTIP_ASIGNAR_AFILIACION_INHABILITADA;
  readonly columnaIndicadoresGestion = afiliacionColumnaTextoIndicadoresSi;
  readonly tooltipAsignarPorFila = mensajeTooltipAsignarAfiliacionPorFila;

  /** Misma regla que pendientes: solo filas en estado 1 y sin indicadores bloqueantes. */
  readonly esFilaSeleccionableParaAsignar = (ctx: {
    data: RequestsMassiveAfiliationListItem;
    index: number;
  }): boolean =>
    ctx.data.request_status === 1 && afiliacionIndicadoresPermitenAsignar(ctx.data);

  requestList: RequestsMassiveAfiliationListItem[] = [];
  aplicantList: ApplicantTypeList[] = [];
  requestTypeList: RequestTypeList[] = [];
  userList: UserList[] = [];
  requestUserList: UserList[] = [];

  ingredient!: string;
  visibleDialog = false;
  visibleDialogInput = false;
  message = '';
  message2 = '';
  buttonmsg = '';
  parameter = [''];
  request_details!: RequestsListAfiliation;
  informative: boolean = false;
  severity = '';
  visibleDialogAlert = false;
  statusOptions!: string[];
  daysOption!: number[];
  selectedDaysOptions!: number[];
  selectedStatusOptions!: string[];
  enableAssign: boolean = false;
  loading: boolean = true;
  PERFIL!: string;
  statusList: RequestStatusAfiliationList[] = [];
  readonly indicadorGestionOpciones: { label: string; value: AfiliacionFiltroIndicadorGestion }[] = [
    { label: 'Novedad Restrictiva', value: 'novedad_restrictiva' },
    { label: 'Pendiente Activar Empresa', value: 'pendiente_activar_empresa' },
    { label: 'Pendiente Dirección', value: 'pendiente_direccion' },
  ];
  private static readonly INDICADOR_GESTION_VALORES: AfiliacionFiltroIndicadorGestion[] = [
    'novedad_restrictiva',
    'pendiente_activar_empresa',
    'pendiente_direccion',
  ];
  private static readonly VALOR_FILTRO_BD: 'Si' = 'Si';
  formGroup: FormGroup<any> = new FormGroup<any>({});
  mensajeReasignacion: string = '';
  //paginador
  first: number = 0;
  page: number = 1;
  rows: number = 10;
  totalRows: number = 0;

  solicitudes: any[] = []; // tus datos

  isBulkAssign: boolean = false; // Saber si es masivo o no
  selectedRequests: RequestsMassiveAfiliationListItem[] = [];
  @ViewChild('dt') table!: Table;

  constructor(
    private userService: Users,
    private router: Router,
    private messageService: MessageService
  ) {
    this.formGroup = new FormGroup({
      filing_number: new FormControl(null),
      dates_range: new FormControl(null),
      doc_id_emp: new FormControl(null),
      request_status_id: new FormControl(null),
      indicador_gestion: new FormControl<AfiliacionFiltroIndicadorGestion[] | null>(null),
    });

    this.formGroup.get('request_status_id')?.valueChanges.subscribe(value => {
      if (value?.length === 0) {
        this.formGroup.get('request_status_id')?.setValue(null);
      }
    });
    this.formGroup.get('indicador_gestion')?.valueChanges.subscribe(value => {
      if (value?.length === 0) {
        this.formGroup.get('indicador_gestion')?.setValue(null);
      }
    });
  }

  private normalizarIndicadoresGestion(raw: unknown): AfiliacionFiltroIndicadorGestion[] {
    if (raw == null || raw === '') {
      return [];
    }
    const arr = Array.isArray(raw) ? raw : [raw];
    const out: AfiliacionFiltroIndicadorGestion[] = [];
    for (const item of arr) {
      const s = String(item);
      if (
        SearchRequestAfiMassiveComponent.INDICADOR_GESTION_VALORES.includes(
          s as AfiliacionFiltroIndicadorGestion
        )
      ) {
        out.push(s as AfiliacionFiltroIndicadorGestion);
      }
    }
    return [...new Set(out)];
  }

  private indicadoresGestionParaPayload(
    filtros: Record<string, any>
  ): AfiliacionFiltroIndicadorGestion[] {
    const desdeFormulario = this.formGroup.get('indicador_gestion')?.value;
    if (desdeFormulario?.length) {
      return this.normalizarIndicadoresGestion(desdeFormulario);
    }
    return this.normalizarIndicadoresGestion(
      filtros['indicador_gestion'] ?? filtros['tipo_novedad']
    );
  }

  ngOnInit() {
    const filtrosGuardados = sessionStorage.getItem('filtrosBusqueda');
    const paginacionGuardada = sessionStorage.getItem('estadoPaginacion');

    if (filtrosGuardados) {
      try {
        const filtros = JSON.parse(filtrosGuardados);
        if (filtros && typeof filtros === 'object') {
          // Convertir las fechas de string a Date antes de asignarlas
          if (filtros.dates_range && filtros.dates_range.length === 2) {
            filtros.dates_range = [
              new Date(filtros.dates_range[0]),
              new Date(filtros.dates_range[1]),
            ];
          }

          // Asegurar que assigned_user es un array (necesario para p-multiSelect)
          if (filtros.assigned_user && !Array.isArray(filtros.assigned_user)) {
            filtros.assigned_user = [filtros.assigned_user]; // Convertir en array si no lo es
          }

          // Filtrar valores nulos antes de asignarlos al formGroup
          const valoresValidos = Object.keys(filtros).reduce((acc, key) => {
            if (filtros[key] !== null && filtros[key] !== '') {
              acc[key] = filtros[key];
            }
            return acc;
          }, {} as any);

          this.formGroup.patchValue(valoresValidos);
        }
      } catch (error) {
        console.error('Error al cargar los filtros:', error);
      }
    }

    if (paginacionGuardada) {
      try {
        const paginacion = JSON.parse(paginacionGuardada);
        this.first = paginacion.first || 0;
        this.rows = paginacion.rows || 10;
        this.page = paginacion.page || 1;
      } catch (error) {
        console.error('Error al cargar la paginación:', error);
      }
    }

    this.PERFIL = sessionStorage.getItem(SessionStorageItems.PERFIL) || '';
    this.searhMassiveRequests();
    this.getRequestStatusList();
    this.loading = false;
  }

  getColor(value: number): string {
    if (value >= 0 && value < 4) {
      return '#01b0ef';
    } else {
      return 'red';
    }
  }

  // onPageChange(event: PaginatorState) {
  //   this.first = event.first || 0;
  //   this.rows = event.rows || 10; // Asegurar que tenga un valor por defecto
  //   this.page = Number(event.page) + 1 || 1; // Ajustar el número de página (1-based)

  //   // 🔹 Guardar la página actual en sessionStorage
  //   sessionStorage.setItem(
  //     'paginatorPage',
  //     JSON.stringify({ first: this.first, rows: this.rows, page: this.page })
  //   );

  //   this.searhRequests();
  // }

  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;

    sessionStorage.getItem('filtrosBusqueda');
    this.searhMassiveRequests();
  }
  cleanForm() {
    sessionStorage.removeItem('filtrosBusqueda');

    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.formGroup.reset();
    this.requestList = [];
    this.searhMassiveRequests();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.searhMassiveRequests();
  }

  searhMassiveRequests() {
    const filtrosGuardados = sessionStorage.getItem('filtrosBusqueda');
    let filtros = filtrosGuardados ? JSON.parse(filtrosGuardados) : {};

    const payload: FilterRequestsMassive = {
      i_date:
        this.formGroup.controls['dates_range'].value?.length > 0
          ? this.convertDates(this.formGroup.controls['dates_range'].value[0])
          : filtros['dates_range']?.length > 0
            ? this.convertDates(filtros['dates_range'][0])
            : null,
      f_date:
        this.formGroup.controls['dates_range'].value?.length > 0
          ? this.convertDates(this.formGroup.controls['dates_range'].value[1])
          : filtros['dates_range']?.length > 0
            ? this.convertDates(filtros['dates_range'][1])
            : null,
      filing_number:
        this.formGroup.controls['filing_number'].value &&
        this.formGroup.controls['filing_number'].value.length > 0
          ? this.formGroup.controls['filing_number'].value
          : filtros['filing_number'] || null,
      doc_id_emp:
        this.formGroup.controls['doc_id_emp'].value &&
        this.formGroup.controls['doc_id_emp'].value.length > 0
          ? this.formGroup.controls['doc_id_emp'].value
          : filtros['doc_id_emp'] || null,
      status_id:
        this.formGroup.controls['request_status_id'].value &&
        this.formGroup.controls['request_status_id'].value.length > 0
          ? this.formGroup.controls['request_status_id'].value
          : filtros['request_status_id'] || null,
      tipo_novedad: (() => {
        const campos = this.indicadoresGestionParaPayload(filtros);
        if (campos.length === 0) return null;
        return campos.map(campo => ({
          campo,
          valor: SearchRequestAfiMassiveComponent.VALOR_FILTRO_BD,
        }));
      })(),
      page: this.page,
      page_size: this.rows,
    };

    this.getRequestMassiveListByFilter(payload);
  }
  convertDates(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }
  getRequestMassiveListByFilter(payload: FilterRequestsMassive) {
    this.userService.getRequestMassiveListByFilter(payload).subscribe({
      next: (response: BodyResponse<RequestsMassiveAfiliationListItem[]>) => {
        if (response.code === 200) {
          const rows = response.data ?? [];
          this.requestList = rows.map(item => {
            const raw = item.filing_date;
            if (raw == null || raw === '') {
              return { ...item, filing_date: '', filing_date_date: undefined };
            }
            const transformedDate = formatDate(raw, 'MM/dd/yyyy', 'en-US');
            const d = new Date(transformedDate);
            return {
              ...item,
              filing_date: transformedDate,
              filing_date_date: Number.isNaN(d.getTime()) ? undefined : d,
            };
          });
          this.daysOption = Array.from(
            new Set(
              this.requestList
                .map(item => item.request_days)
                .filter((d): d is number => d != null && !Number.isNaN(Number(d)))
            )
          );
          this.statusOptions = Array.from(
            new Set(
              this.requestList
                .map(item => item.cod_estatus ?? item.status_name ?? '')
                .filter(v => String(v).trim() !== '')
            )
          );
          this.totalRows = Number(response.message);
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }

  /** Catálogo de estados de afiliación (mismo endpoint que búsqueda pendientes). */
  getRequestStatusList() {
    this.userService.getRequestAfiliationStatusList().subscribe({
      next: (response: BodyResponse<RequestStatusAfiliationList[]>) => {
        if (response.code === 200) {
          this.statusList = (response.data ?? []).map(row => ({
            ...row,
            id: row.id ?? row.request_status_id,
            codigo: row.codigo ?? row.status_name ?? '',
          }));
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }

  /** Documento de empresa: API nuevo o campos legacy (`doc_id`). */
  displayDocEmpresa(row: RequestsMassiveAfiliationListItem): string {
    const v =
      row.doc_empresa ?? row.doc_id_empresa ?? row.doc_id ?? '';
    const s = v != null ? String(v).trim() : '';
    return s !== '' ? s : '—';
  }

  displayNombreEmpresa(row: RequestsMassiveAfiliationListItem): string {
    const v = row.name_empresa ?? row.applicant_name ?? '';
    const s = v != null ? String(v).trim() : '';
    return s !== '' ? s : '—';
  }

  displayEstadoSolicitud(row: RequestsMassiveAfiliationListItem): string {
    const v = row.cod_estatus ?? row.status_name ?? '';
    const s = v != null ? String(v).trim() : '';
    return s !== '' ? s : '—';
  }

  /** Botón Asignar/Reasignar: solo cuando el API marca pendiente de asignación (`request_status === 1`). */
  esPendienteAsignacion(row: RequestsMassiveAfiliationListItem): boolean {
    return row.request_status === 1;
  }

  puedeActivarAsignar(row: RequestsMassiveAfiliationListItem): boolean {
    return afiliacionIndicadoresPermitenAsignar(row);
  }

  todasSeleccionadasPuedenAsignar(): boolean {
    return (
      this.selectedRequests.length > 0 &&
      this.selectedRequests.every(
        r => r.request_status === 1 && afiliacionIndicadoresPermitenAsignar(r)
      )
    );
  }

  hayFilasSeleccionablesParaAsignar(): boolean {
    return this.requestList.some(
      r => r.request_status === 1 && afiliacionIndicadoresPermitenAsignar(r)
    );
  }

  /** Convierte fila del listado masivo al contrato de asignación de afiliación. */
  private massiveRowToAfiliationRow(row: RequestsMassiveAfiliationListItem): RequestsListAfiliation {
    const filingDate =
      typeof row.filing_date === 'string' ? row.filing_date : String(row.filing_date ?? '');
    return {
      request_id: row.request_id,
      filing_number: row.filing_number != null ? String(row.filing_number) : null,
      filing_date: filingDate,
      doc_trabajador: row.doc_trabajador ?? '',
      name_trabajador: row.name_trabajador ?? '',
      documents_beneficiarios: row.documents_beneficiarios ?? '',
      names_beneficiarios: row.names_beneficiarios ?? '',
      type_doc_id_tr: row.tipo_doc_trabajador ?? row.type_doc_id_tr ?? null,
      type_doc_bn_tr: row.tipos_doc_beneficiarios ?? row.type_doc_bn_tr ?? null,
      doc_id_tr: row.doc_trabajador ?? row.doc_id_tr ?? null,
      doc_id_bn: row.documents_beneficiarios ?? row.doc_id_bn ?? null,
      status_name: row.status_name ?? null,
      id_empresa: row.id_empresa ?? '',
      name_empresa: row.name_empresa ?? row.applicant_name ?? '',
      request_status: row.request_status,
      cod_estatus: row.cod_estatus ?? row.status_name ?? '',
      assigned_user: row.assigned_user ?? null,
      user_name_completed: row.user_name_completed ?? '',
      mensaje_reasignacion: row.mensaje_reasignacion ?? '',
      total_count: row.total_count ?? 0,
      pendiente_direccion: row.pendiente_direccion,
      pendiente_activar_empresa: row.pendiente_activar_empresa,
      novedad_restrictiva: row.novedad_restrictiva,
    };
  }

  filaCerrada(row: RequestsMassiveAfiliationListItem): boolean {
    const cod = (row.cod_estatus || '').toLowerCase();
    const name = (row.status_name || '').toLowerCase();
    return cod.includes('cerrad') || name.includes('cerrad');
  }

  assignRequest(row: RequestsMassiveAfiliationListItem) {
    this.isBulkAssign = false;

    if (!this.esPendienteAsignacion(row)) {
      this.showSuccessMessage(
        'warn',
        'Acción no disponible',
        'Solo puede asignar o reasignar solicitudes pendientes de asignación.'
      );
      return;
    }

    if (!afiliacionIndicadoresPermitenAsignar(row)) {
      this.showSuccessMessage(
        'warn',
        'Asignación no disponible',
        'No puede asignar mientras pendiente dirección, pendiente activar empresa o novedad restrictiva esté en Sí.'
      );
      return;
    }

    this.request_details = this.massiveRowToAfiliationRow(row);

    if (this.request_details.assigned_user == null || this.request_details.assigned_user === '') {
      this.message = 'Asignar responsable de solicitud';
      this.buttonmsg = 'Asignar';
      this.request_details.request_status = 2;
    } else {
      this.message = 'Reasignar responsable de solicitud';
      this.buttonmsg = 'Reasignar';
      this.request_details.request_status = 3;
    }
    this.visibleDialogInput = true;
    this.parameter = ['Colaborador'];
  }

  closeDialog(value: boolean) {
    this.visibleDialog = false;
    if (value) {
      //
    }
  }
  closeDialogInput(value: boolean) {
    this.visibleDialogInput = false;
    this.enableAssign = value;
    if (value) {
      // accion de eliminar
    }
  }
  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAssign = value;
  }

  setParameter(inputValue: {
    userName: string;
    userNameCompleted: string;
    mensajeReasignacion: string;
  }) {
    if (!this.enableAssign) return;
  
    if (this.isBulkAssign) {
      const requestsToAssign = this.selectedRequests.map(request => {
        const afi = this.massiveRowToAfiliationRow(request);
        afi.assigned_user = inputValue.userName;
        afi.user_name_completed = inputValue.userNameCompleted;
        afi.mensaje_reasignacion = inputValue.mensajeReasignacion;
        afi.request_status = 2;

        return this.userService.assignUserToRequestAfiliation(afi);
      });
  
      forkJoin(requestsToAssign).subscribe({
        next: (responses) => {
          responses.forEach((response, index) => {
            const filingNumber =
              this.selectedRequests[index]?.numero_solicitud_masiva ??
              this.selectedRequests[index]?.filing_number ??
              'Desconocido';
            if (response.code === 200) {
              this.showSuccessMessage('success', 'Éxito', `Asignado: ${filingNumber}`);
            } else {
              this.showSuccessMessage('error', 'Falló', `Falló asignación: ${filingNumber}`);
            }
          });
        },
        error: (err) => {
          console.error('Error en asignación masiva:', err);
          this.showSuccessMessage('error', 'Error', 'Error durante la asignación masiva.');
        },
        complete: () => {
          this.selectedRequests = [];
          this.table?.clear(); // Limpia visualmente la selección
          this.visibleDialogInput = false;
          this.ngOnInit(); // Refresca datos
        },
      });
  
    } else {
      // Asignación individual
      if (this.request_details.assigned_user === inputValue.userName) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Verifique el responsable a asignar';
        this.message2 = 'Debe seleccionar un colaborador diferente';
        this.severity = 'danger';
        return;
      }
  
      this.request_details.assigned_user = inputValue.userName;
      this.request_details.user_name_completed = inputValue.userNameCompleted;
      this.request_details.mensaje_reasignacion = inputValue.mensajeReasignacion;
  
      this.userService.assignUserToRequestAfiliation(this.request_details).subscribe({
        next: (response: BodyResponse<unknown>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Éxito', 'Asignación exitosa');
          } else {
            this.showSuccessMessage('error', 'Falló', 'Asignación fallida');
          }
        },
        error: (err) => console.error(err),
        complete: () => {
          this.visibleDialogInput = false;
          this.ngOnInit();
        },
      });
    }
  }
  
    

  redirectDetails(request_id: number) {
    let filtros = this.formGroup.value;

    // Convertir valores null a cadenas vacías o arrays vacíos si es necesario
    Object.keys(filtros).forEach(key => {
      if (filtros[key] === null) {
        filtros[key] = Array.isArray(filtros[key]) ? [] : '';
      }
    });

    sessionStorage.setItem('filtrosBusqueda', JSON.stringify(filtros));

    const estadoPaginacion = {
      first: this.first,
      rows: this.rows,
      page: this.page,
    };

    sessionStorage.setItem('estadoPaginacion', JSON.stringify(estadoPaginacion));

    localStorage.removeItem('route');
    localStorage.setItem('route', this.router.url);
    this.router.navigate([RoutesApp.REQUEST_DETAILS_AFILIATION, request_id]);
  }

  // redirectDetails(request_id: number) {
  //   localStorage.removeItem('route');
  //   localStorage.setItem('route', this.router.url);
  //   this.router.navigate([RoutesApp.REQUEST_DETAILS, request_id]);
  // }

  asignarSeleccionadas(): void {
    // Aquí haces la lógica de asignación masiva, por ejemplo:
    console.log('Solicitudes seleccionadas:', this.selectedRequests);

    // Llamar a tu servicio o abrir modal
    // this.miServicio.asignar(this.selectedSolicitudes).subscribe(...)
  }

  assignSelectedRequests(requests: RequestsMassiveAfiliationListItem[]) {
    if (!requests || requests.length === 0) return;

    const noCumplen = requests.filter(r => !afiliacionIndicadoresPermitenAsignar(r));
    if (noCumplen.length > 0) {
      this.showSuccessMessage(
        'warn',
        'Asignación no disponible',
        'No puede asignar en lote si alguna solicitud tiene pendiente dirección, pendiente activar empresa o novedad restrictiva en Sí.'
      );
      return;
    }

    this.isBulkAssign = true;
    this.selectedRequests = requests;

    this.message = 'Asignar responsable a solicitudes seleccionadas';
    this.buttonmsg = 'Asignar';
    this.parameter = ['Colaborador'];
    this.visibleDialogInput = true;
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnterKeyPressed(event: Event): void {
    const activeElement = document.activeElement;
    const isOverlayOpen =
      document.querySelector('.p-overlay-visible') || document.querySelector('.cdk-overlay-pane');

    // ✅ Verifica si hay algún valor en los filtros
    const hasActiveFilters = Object.values(this.formGroup.value).some(
      (value) =>
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
    );

    // ✅ Solo ejecuta si no hay overlays abiertos y hay al menos un filtro activo
    if (!isOverlayOpen && hasActiveFilters) {
      event.preventDefault(); // evitar comportamiento por defecto
      this.initPaginador();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKeyPressed(event: Event): void {
    const isOverlayOpen =
      document.querySelector('.p-overlay-visible') || document.querySelector('.cdk-overlay-pane');

    // Solo limpiar si no hay overlays abiertos (para no interferir con selección)
    if (!isOverlayOpen) {
      event.preventDefault();
      this.cleanForm();
    }
  }

}
