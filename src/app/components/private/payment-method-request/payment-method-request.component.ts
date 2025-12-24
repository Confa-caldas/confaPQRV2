import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  FilterPaymentMethodRequests,
  PaymentMethodRequestList,
  RequestPaymentMethodStatusList,
  PaymentMethodRequestsInManagementByUser,
} from '../../../models/users.interface';
import { RoutesApp } from '../../../enums/routes.enum';
import { MessageService } from 'primeng/api';
import { SessionStorageItems } from '../../../enums/session-storage-items.enum';
import { FormControl, FormGroup } from '@angular/forms';
import { PaginatorState } from 'primeng/paginator';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-payment-method-request',
  templateUrl: './payment-method-request.component.html',
  styleUrl: './payment-method-request.component.scss',
})
export class PaymentMethodRequestComponent implements OnInit {
  requestList: PaymentMethodRequestList[] = [];
  statusList: RequestPaymentMethodStatusList[] = [];

  loading: boolean = false;
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
    });

    // Normalización: si el multiSelect queda vacío, establecer null
    this.formGroup.get('request_status_id')?.valueChanges.subscribe(value => {
      if (Array.isArray(value) && value.length === 0) {
        this.formGroup.get('request_status_id')?.setValue(null, { emitEvent: false });
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
    const filtrosGuardados = sessionStorage.getItem('pmr_filtrosBusqueda');
    let filtros = filtrosGuardados ? JSON.parse(filtrosGuardados) : {};

    const payload: FilterPaymentMethodRequests = {
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
      page: this.page,
      page_size: this.rows,
    };

    this.getPaymentMethodRequestListByFilter(payload);
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
          this.requestList = response.data.map(item => {
            // Normalize any date fields if needed (example: request_datetime)
            const filingDate = item.request_datetime
              ? this.convertDates(item.request_datetime as unknown as string)
              : null;
            return {
              ...item,
              request_datetime: filingDate ?? item.request_datetime,
            } as PaymentMethodRequestList;
          });

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

    showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }

  redirectDetails(request_id: number) {
    // Obtener el registro objetivo
    const current = this.requestList.find(r => r.request_id === request_id);

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
            'La solicitud ya esta siendo gestionada por otro usuario'
          );
          return;
        }
      } else {
        // Validación 2: Si NO está en gestión, consultar al backend si el usuario tiene otra solicitud en gestión
        const payload = {
          internal_management_user: this.user,
          request_id: request_id,
        }
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
