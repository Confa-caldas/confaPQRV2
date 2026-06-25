import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  FilterPaymentMethodRequests,
  PaymentMethodRequestList,
  RequestPaymentMethodStatusList,
  PaymentMethodRequestsInManagementByUser,
  PaymentMethodProcessStatusList,
  TransferProcessStatusList,
  TransferStatusList,
} from '../../../models/users.interface';
import { RoutesApp } from '../../../enums/routes.enum';
import { MessageService } from 'primeng/api';
import { SessionStorageItems } from '../../../enums/session-storage-items.enum';
import { FormControl, FormGroup } from '@angular/forms';
import { PaginatorState } from 'primeng/paginator';
import { Table } from 'primeng/table';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-payment-method-request',
  templateUrl: './payment-method-request.component.html',
  styleUrl: './payment-method-request.component.scss',
})
export class PaymentMethodRequestComponent implements OnInit {
  readonly transferStatusPendingValue = 'PENDIENTE_NULL';

  requestList: PaymentMethodRequestList[] = [];
  selectedRequests: PaymentMethodRequestList[] = [];
  statusList: RequestPaymentMethodStatusList[] = [];
  paymentMethodStatusList: PaymentMethodProcessStatusList[] = [];
  transferProcessStatusList: TransferProcessStatusList[] = [];
  transferStatusList: TransferStatusList[] = [];

  loading: boolean = false;
  exporting: boolean = false;
  bulkMarking: boolean = false;
  selectingAllEligible: boolean = false;
  selectAllEligibleMode: boolean = false;
  visibleBulkMarkModal: boolean = false;
  bulkMarkMessage =
    '¿Está seguro de marcar la transferencia exitosa para los registros seleccionados?';
  private pendingRequestIds: number[] = [];
  private isUpdatingBulkSelection = false;
  PERFIL!: string;
  user!: string;
  formGroup: FormGroup<any> = new FormGroup<any>({});
  @ViewChild('dt') table!: Table;

  //paginator
  first: number = 0;
  page: number = 1;
  rows: number = 10;
  totalRows: number = 0;

  constructor(
    private userService: Users,
    private router: Router,
    private messageService: MessageService
  ) {
    this.formGroup = new FormGroup({
      filing_number: new FormControl(null),
      dates_range: new FormControl(null),
      worker_document_number: new FormControl(null),
      request_status_id: new FormControl(null),
      payment_method_status_id: new FormControl(null),
      transfer_process_status_id: new FormControl(null),
      transfer_status_id: new FormControl(null),
    });

    // Normalización: si el multiSelect queda vacío, establecer null
    this.formGroup.get('request_status_id')?.valueChanges.subscribe(value => {
      if (Array.isArray(value) && value.length === 0) {
        this.formGroup.get('request_status_id')?.setValue(null, { emitEvent: false });
      }
    });

    this.formGroup.get('payment_method_status_id')?.valueChanges.subscribe(value => {
      if (Array.isArray(value) && value.length === 0) {
        this.formGroup.get('payment_method_status_id')?.setValue(null, { emitEvent: false });
      }
    });

    this.formGroup.get('transfer_process_status_id')?.valueChanges.subscribe(value => {
      if (Array.isArray(value) && value.length === 0) {
        this.formGroup.get('transfer_process_status_id')?.setValue(null, { emitEvent: false });
      }
    });

    this.formGroup.get('transfer_status_id')?.valueChanges.subscribe(value => {
      if (Array.isArray(value) && value.length === 0) {
        this.formGroup.get('transfer_status_id')?.setValue(null, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    // Restaurar filtros y paginación
    const filtrosGuardados = sessionStorage.getItem('pmr_filtrosBusqueda');
    const paginacionGuardada = sessionStorage.getItem('pmr_estadoPaginacion');

    if (filtrosGuardados) {
      try {
        const filtros = JSON.parse(filtrosGuardados);
        if (filtros && typeof filtros === 'object') {
          if (filtros.dates_range && filtros.dates_range.length === 2) {
            filtros.dates_range = [
              new Date(filtros.dates_range[0]),
              new Date(filtros.dates_range[1]),
            ];
          }

          if (filtros.request_status_id && !Array.isArray(filtros.request_status_id)) {
            filtros.request_status_id = [filtros.request_status_id];
          }

          if (filtros.payment_method_status_id && !Array.isArray(filtros.payment_method_status_id)) {
            filtros.payment_method_status_id = [filtros.payment_method_status_id];
          }

          if (filtros.transfer_process_status_id && !Array.isArray(filtros.transfer_process_status_id)) {
            filtros.transfer_process_status_id = [filtros.transfer_process_status_id];
          }

          if (filtros.transfer_status_id && !Array.isArray(filtros.transfer_status_id)) {
            filtros.transfer_status_id = [filtros.transfer_status_id];
          }

          if (Array.isArray(filtros.transfer_status_id)) {
            filtros.transfer_status_id = filtros.transfer_status_id.map(
              (id: number | string | null) =>
                id === null || id === 0 ? this.transferStatusPendingValue : id
            );
          }

          const valoresValidos = Object.keys(filtros).reduce((acc: any, key) => {
            if (filtros[key] !== null && filtros[key] !== '') {
              acc[key] = filtros[key];
            }
            return acc;
          }, {});

          this.formGroup.patchValue(valoresValidos);
        }
      } catch (error) {
        console.error('Error al cargar los filtros PMR:', error);
      }
    }

    if (paginacionGuardada) {
      try {
        const pag = JSON.parse(paginacionGuardada);
        this.first = pag.first || 0;
        this.rows = pag.rows || 10;
        this.page = pag.page || 1;
      } catch (error) {
        console.error('Error al cargar la paginación PMR:', error);
      }
    }

    this.PERFIL = sessionStorage.getItem(SessionStorageItems.PERFIL) || '';
    this.user = sessionStorage.getItem(SessionStorageItems.USER) || '';

    this.searchRequests();
    this.getRequestPaymentMethodStatusList();
    this.getPaymentMethodProcessStatusList();
    this.getTransferProcessStatusList();
    this.getTransferStatusList();
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 10;
    this.page = Number(event.page) + 1 || 1;
    this.searchRequests();
  }

  initPaginator() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    const filtros = { ...this.formGroup.value };
    Object.keys(filtros).forEach(key => {
      if (filtros[key] === null) {
        filtros[key] = Array.isArray(filtros[key]) ? [] : '';
      }
    });
    sessionStorage.setItem('pmr_filtrosBusqueda', JSON.stringify(filtros));
    sessionStorage.setItem(
      'pmr_estadoPaginacion',
      JSON.stringify({ first: this.first, rows: this.rows, page: this.page })
    );
    this.searchRequests();
  }

  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.formGroup.reset();
    this.requestList = [];
    this.clearBulkSelection();
    this.table?.clear();
    sessionStorage.removeItem('pmr_filtrosBusqueda');
    sessionStorage.removeItem('pmr_estadoPaginacion');
    this.searchRequests();
  }

  private convertDate(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  searchRequests() {
    const payload = this.buildFilterPayload(this.page, this.rows);
    this.getPaymentMethodRequestListByFilter(payload);
  }

  private buildFilterPayload(page: number, pageSize: number): FilterPaymentMethodRequests {
    const filtrosGuardados = sessionStorage.getItem('pmr_filtrosBusqueda');
    const filtros = filtrosGuardados ? JSON.parse(filtrosGuardados) : {};

    return {
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
      filing_number: this.validateFilingNumber(
        this.formGroup.controls['filing_number'].value || filtros['filing_number']
      ),
      worker_document_number:
        this.formGroup.controls['worker_document_number'].value &&
        this.formGroup.controls['worker_document_number'].value.length > 0
          ? this.formGroup.controls['worker_document_number'].value
          : filtros['worker_document_number'] || null,
      status_id:
        this.formGroup.controls['request_status_id'].value &&
        this.formGroup.controls['request_status_id'].value.length > 0
          ? this.formGroup.controls['request_status_id'].value
          : filtros['request_status_id'] || null,
      payment_method_status_id:
        this.formGroup.controls['payment_method_status_id'].value &&
        this.formGroup.controls['payment_method_status_id'].value.length > 0
          ? this.formGroup.controls['payment_method_status_id'].value
          : filtros['payment_method_status_id'] || null,
      transfer_process_status_id:
        this.formGroup.controls['transfer_process_status_id'].value &&
        this.formGroup.controls['transfer_process_status_id'].value.length > 0
          ? this.formGroup.controls['transfer_process_status_id'].value
          : filtros['transfer_process_status_id'] || null,
      transfer_status_id: this.mapTransferStatusFilter(
        this.formGroup.controls['transfer_status_id'].value?.length > 0
          ? this.formGroup.controls['transfer_status_id'].value
          : filtros['transfer_status_id'] || null
      ),
      page,
      page_size: pageSize,
    };
  }

  exportToExcel(): void {
    if (!this.totalRows) {
      this.showSuccessMessage('warn', 'Validación', 'No hay datos para exportar.');
      return;
    }

    const payload = this.buildFilterPayload(1, this.totalRows);
    this.exporting = true;

    this.userService.getRequestPaymentMethodListByFilter(payload).subscribe({
      next: (response: BodyResponse<PaymentMethodRequestList[]>) => {
        if (response.code === 200 && response.data?.length) {
          const exportData = response.data.map(row => ({
            'Numero de radicado': (row as PaymentMethodRequestList & { radication_code?: string })
              .radication_code || row.filing_number || '',
            'Fecha y hora solicitud': this.formatDateTime(row.request_datetime),
            'Tipo doc. trabajador': row.worker_document_type || '',
            'Número doc. trabajador': row.worker_document_number || '',
            'Nombre completo trabajador': row.worker_full_name || '',
            'Tipo doc. administrador': row.admin_document_type || '',
            'Número doc. administrador': row.admin_document_number || '',
            'Nombre completo administrador': row.admin_full_name || '',
            'Medio de pago anterior': row.previous_payment_method || '',
            'Medio de pago nuevo': row.new_payment_method || '',
            'Estado solicitud': row.payment_method_status_name || '',
            'Estado medio de pago': row.payment_method_process_status_name || '',
            'Estado traslado': row.transfer_process_status_name || '',
            'Estado transferencia': row.transfer_status_name ?? '',
          }));
          this.downloadExcel(exportData);
        } else {
          this.showSuccessMessage('warn', 'Validación', 'No hay datos para exportar.');
        }
      },
      error: () => {
        this.showSuccessMessage('error', 'Error', 'Ocurrió un error al exportar los datos.');
      },
      complete: () => {
        this.exporting = false;
      },
    });
  }

  private formatDateTime(value: string | null | undefined): string {
    if (!value) return '';

    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  private downloadExcel(exportData: Record<string, string>[]): void {
    import('xlsx').then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(exportData);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: ArrayBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
      });

      FileSaver.saveAs(
        data,
        `Solicitudes_cambio_medio_pago_export_${new Date().getTime()}.xlsx`
      );
    });
  }

  convertDates(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  private validateFilingNumber(value: string | null | undefined): string | null {
    if (!value) return null;
    const trimmed = String(value).trim().toUpperCase();
    // Pattern like PTL-00000001 (3 letters dash 8 digits)
    const re = /^[A-Z]{3}-\d{8}$/;
    return re.test(trimmed) ? trimmed : null;
  }

  getPaymentMethodRequestListByFilter(payload: FilterPaymentMethodRequests) {
    this.loading = true;
    this.userService.getRequestPaymentMethodListByFilter(payload).subscribe({
      next: (response: BodyResponse<PaymentMethodRequestList[]>) => {
        if (response.code === 200) {
          this.requestList = response.data;
          this.totalRows = Number(response.message);
        } else {
          // Use a toast if available; keeping simple here
          console.error('Operación fallida en PMR');
        }
      },
      error: (err: any) => {
        console.error('Error PMR:', err);
      },
      complete: () => {
        this.loading = false;
        sessionStorage.setItem(
          'pmr_estadoPaginacion',
          JSON.stringify({ first: this.first, rows: this.rows, page: this.page })
        );
      },
    });
  }

  getRequestPaymentMethodStatusList() {
    this.userService.getRequestPaymentMethodStatusList().subscribe({
      next: (response: BodyResponse<RequestPaymentMethodStatusList[]>) => {
        if (response.code === 200) {
          this.statusList = response.data;
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

  getPaymentMethodProcessStatusList() {
    this.userService.getPaymentMethodProcessStatusList().subscribe({
      next: (response: BodyResponse<PaymentMethodProcessStatusList[]>) => {
        if (response.code === 200) {
          this.paymentMethodStatusList = response.data;
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

  getTransferProcessStatusList() {
    this.userService.getTransferProcessStatusList().subscribe({
      next: (response: BodyResponse<TransferProcessStatusList[]>) => {
        if (response.code === 200) {
          this.transferProcessStatusList = response.data;
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

  getTransferStatusList() {
    this.userService.getTransferStatusList().subscribe({
      next: (response: BodyResponse<TransferStatusList[]>) => {
        if (response.code === 200) {
          this.transferStatusList = [
            {
              transfer_status_id: this.transferStatusPendingValue as unknown as number,
              transfer_status_name: 'Pendiente',
              is_active: 1,
            },
            ...response.data,
          ];
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

  private mapTransferStatusFilter(
    value: (number | string | null)[] | null | undefined
  ): number[] | null {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return null;
    }

    return value.map(id =>
      id === this.transferStatusPendingValue || id === null ? 0 : (id as number)
    );
  }

  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }

  isEligibleForBulkMark(row: PaymentMethodRequestList): boolean {
    return (
      row.payment_method_status_name?.trim() === 'Tramitada' &&
      row.payment_method_process_status_name?.trim() === 'Aplicado' &&
      row.transfer_process_status_name?.trim() === 'Aplicado con saldo' &&
      (row.transfer_status_name === null ||
        row.transfer_status_name === undefined ||
        row.transfer_status_name === '')
    );
  }

  hasEligibleRowsOnPage(): boolean {
    return this.requestList.some(row => this.isEligibleForBulkMark(row));
  }

  isHeaderCheckboxChecked(): boolean {
    if (this.selectAllEligibleMode) {
      return true;
    }

    const eligibleOnPage = this.requestList.filter(row => this.isEligibleForBulkMark(row));
    if (!eligibleOnPage.length || !this.selectedRequests.length) {
      return false;
    }

    return eligibleOnPage.every(row =>
      this.selectedRequests.some(selected => selected.request_id === row.request_id)
    );
  }

  onToggleSelectAllEligible(checked: boolean): void {
    if (checked) {
      this.selectAllEligibleRequests();
      return;
    }

    this.selectAllEligibleMode = false;
    this.clearBulkSelection();
  }

  onSelectionChange(selection: PaymentMethodRequestList[]): void {
    if (this.isUpdatingBulkSelection) {
      return;
    }

    if (this.selectAllEligibleMode) {
      this.selectAllEligibleMode = false;
    }

    this.selectedRequests = selection;
  }

  selectAllEligibleRequests(): void {
    if (!this.totalRows) {
      this.showSuccessMessage('warn', 'Validación', 'No hay registros para seleccionar.');
      return;
    }

    this.selectingAllEligible = true;
    const payload = this.buildFilterPayload(1, this.totalRows);

    this.userService.getRequestPaymentMethodListByFilter(payload).subscribe({
      next: (response: BodyResponse<PaymentMethodRequestList[]>) => {
        if (response.code === 200) {
          const eligible = response.data.filter(row => this.isEligibleForBulkMark(row));

          if (!eligible.length) {
            this.showSuccessMessage(
              'warn',
              'Validación',
              'No hay registros elegibles para marcar en el resultado actual.'
            );
            this.selectAllEligibleMode = false;
            this.clearBulkSelection();
            return;
          }

          this.isUpdatingBulkSelection = true;
          this.selectedRequests = eligible;
          this.selectAllEligibleMode = true;
          this.isUpdatingBulkSelection = false;
        } else {
          this.showSuccessMessage('error', 'Fallida', 'No fue posible cargar los registros.');
        }
      },
      error: () => {
        this.showSuccessMessage('error', 'Error', 'Ocurrió un error al seleccionar los registros.');
      },
      complete: () => {
        this.selectingAllEligible = false;
      },
    });
  }

  openBulkMarkModal(): void {
    const requestIds = this.selectedRequests
      .filter(row => this.isEligibleForBulkMark(row))
      .map(row => row.request_id);

    if (!requestIds.length) {
      this.showSuccessMessage('warn', 'Validación', 'No hay registros válidos seleccionados.');
      return;
    }

    this.pendingRequestIds = [...requestIds];
    this.visibleBulkMarkModal = true;
  }

  closeBulkMarkModal(confirmed: boolean): void {
    this.visibleBulkMarkModal = false;

    if (!confirmed) {
      this.pendingRequestIds = [];
      return;
    }

    const requestIds = [...this.pendingRequestIds];
    this.pendingRequestIds = [];

    if (!requestIds.length) {
      this.showSuccessMessage('warn', 'Validación', 'No hay registros válidos para marcar.');
      return;
    }

    this.bulkMarking = true;

    this.userService.markSuccessfulTransfer({ request_id: requestIds }).subscribe({
      next: (response: BodyResponse<string>) => {
        if (response.code === 200) {
          this.showSuccessMessage(
            'success',
            'Éxito',
            'Las transferencias fueron marcadas exitosamente.'
          );
        } else {
          this.showSuccessMessage('error', 'Fallida', response.message || 'Operación fallida.');
        }
      },
      error: () => {
        this.showSuccessMessage('error', 'Error', 'Ocurrió un error al marcar las transferencias.');
      },
      complete: () => {
        this.bulkMarking = false;
        this.clearBulkSelection();
        this.searchRequests();
      },
    });
  }

  private clearBulkSelection(): void {
    this.selectedRequests = [];
    this.pendingRequestIds = [];
    this.selectAllEligibleMode = false;
    this.table?.clear();
  }

  redirectDetails(request_id: number) {
    // Obtener el registro objetivo
    const current = this.requestList.find(r => r.request_id === request_id);
    console.log('Registro actual:', current);

    // Función utilitaria para interpretar valores truthy
    const isTrue = (v: any) => {
      if (v === true) return true;
      if (typeof v === 'number') return v === 1;
      if (typeof v === 'string') {
        const s = v.trim().toLowerCase();
        return s === 'true' || s === '1' || s === 'si' || s === 'sí';
      }
      return false;
    };

    if (current) {
      const enGestionActual = isTrue(current.internal_management);
      const usuarioGestionActual = (current.internal_management_user || '').trim();

      // Validación 1: Si está en gestión interna
      if (enGestionActual) {
        if (usuarioGestionActual && usuarioGestionActual === this.user) {
          // Permite continuar
        } else {
          this.showSuccessMessage(
            'warn',
            'Gestión en curso',
            'La solicitud ya esta siendo gestionada por el usuario: ' +
              current.internal_management_user
          );
          return;
        }
      } else {
        // Validación 2: Si NO está en gestión, consultar al backend si el usuario tiene otra solicitud en gestión
        const payload = {
          internal_management_user: this.user,
          request_id: request_id,
        };
        this.userService.getPaymentMethodRequestsInManagementByUser(payload).subscribe({
          next: (resp: BodyResponse<PaymentMethodRequestsInManagementByUser>) => {
            if (resp.code === 200 && Array.isArray(resp.data) && resp.data.length > 0) {
              // Encontró otra solicitud en gestión
              const otra = resp.data[0];
              const radicado = otra.filing_number || otra.request_id;
              this.showSuccessMessage(
                'warn',
                'Gestión pendiente',
                `Usted ya tiene la solicitud con radicado No ${radicado} en gestión`
              );
              return;
            } else {
              // No tiene otra solicitud en gestión, continuar flujo
              this.continueNavigate(request_id);
            }
          },
          error: () => {
            // En caso de error, por seguridad permitir continuar pero se puede ajustar según negocio
            this.continueNavigate(request_id);
          },
        });
        return; // Evita seguir ejecutando y que navegue dos veces
      }
    }

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

    // Si llegó hasta aquí sin entrar al flujo async de validación 2, continúa
    this.continueNavigate(request_id);
  }

  private continueNavigate(request_id: number) {
    localStorage.removeItem('route');
    localStorage.setItem('route', this.router.url);
    this.router.navigate([RoutesApp.PAYMENT_METHOD_REQUEST_DETAILS, request_id]);
  }
}
