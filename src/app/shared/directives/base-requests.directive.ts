import { Directive, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { PaginatorState } from 'primeng/paginator';
import { MessageService } from 'primeng/api';
import { BodyResponse } from '../../models/shared/body-response.inteface';
import {
  FilterRequestsAfiliation,
  RequestStatusAfiliationList,
  RequestsListAfiliation,
  UserList,
} from '../../models/users.interface';
import { RoutesApp } from '../../enums/routes.enum';
import { SessionStorageItems } from '../../enums/session-storage-items.enum';
import { Users } from '../../services/users.service';

/**
 * Clase base para búsqueda y listado de solicitudes de afiliación (filtros, paginación y carga vía API).
 * Los componentes hijos implementan {@link searchRequests} para definir el criterio de estado (`status_id`).
 */
@Directive()
export abstract class BaseRequestsDirective implements OnInit {
  formGroup: FormGroup = new FormGroup({});
  requestList: RequestsListAfiliation[] = [];
  first = 0;
  page = 1;
  rows = 10;
  totalRows = 0;
  loading = true;
  PERFIL = '';
  statusList: RequestStatusAfiliationList[] = [];
  userList: UserList[] = [];

  constructor(
    protected userService: Users,
    protected router: Router,
    protected messageService: MessageService
  ) {
    this.formGroup = new FormGroup({
      filing_number: new FormControl(null),
      dates_range: new FormControl(null),
      doc_id_tr: new FormControl(null),
      doc_id_bn: new FormControl(null),
      applicant_name_emp: new FormControl(null),
      request_status_id: new FormControl(null),
      assigned_user: new FormControl(null),
    });

    this.formGroup.get('request_status_id')?.valueChanges.subscribe(value => {
      if (value?.length === 0) {
        this.formGroup.get('request_status_id')?.setValue(null);
      }
    });
    this.formGroup.get('assigned_user')?.valueChanges.subscribe(value => {
      if (value?.length === 0) {
        this.formGroup.get('assigned_user')?.setValue(null);
      }
    });
  }

  ngOnInit(): void {
    const filtrosGuardados = sessionStorage.getItem('filtrosBusqueda');
    const paginacionGuardada = sessionStorage.getItem('estadoPaginacion');

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

          if (filtros.assigned_user && !Array.isArray(filtros.assigned_user)) {
            filtros.assigned_user = [filtros.assigned_user];
          }

          const valoresValidos = Object.keys(filtros).reduce((acc, key) => {
            if (filtros[key] !== null && filtros[key] !== '') {
              acc[key] = filtros[key];
            }
            return acc;
          }, {} as Record<string, unknown>);

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

    this.searchRequests();
    this.getRequestStatusList();
    this.getUsersList();
    this.loading = false;
  }

  /** Cada pantalla arma el payload (especialmente `status_id`) y delega la suscripción en {@link getRequestListByFilter}. */
  abstract searchRequests(): void;

  protected getMergedFiltros(): Record<string, any> {
    const filtrosGuardados = sessionStorage.getItem('filtrosBusqueda');
    return filtrosGuardados ? JSON.parse(filtrosGuardados) : {};
  }

  protected buildAfiliationFilterPayload(
    filtros: Record<string, any>,
    statusId: number | number[] | null | undefined
  ): FilterRequestsAfiliation {
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
      filing_number:
        this.formGroup.controls['filing_number'].value &&
        this.formGroup.controls['filing_number'].value.length > 0
          ? this.formGroup.controls['filing_number'].value
          : filtros['filing_number'] || null,
      doc_id_tr:
        this.formGroup.controls['doc_id_tr'].value &&
        this.formGroup.controls['doc_id_tr'].value.length > 0
          ? this.formGroup.controls['doc_id_tr'].value
          : filtros['doc_id_tr'] || null,
      doc_id_bn:
        this.formGroup.controls['doc_id_bn'].value &&
        this.formGroup.controls['doc_id_bn'].value.length > 0
          ? this.formGroup.controls['doc_id_bn'].value
          : filtros['doc_id_bn'] || null,
      applicant_name_emp:
        (this.formGroup.controls['applicant_name_emp'].value?.trim()?.length ?? 0) > 0
          ? this.formGroup.controls['applicant_name_emp'].value
          : filtros['applicant_name_emp'] || null,
      status_id: statusId ?? null,
      assigned_user:
        this.formGroup.controls['assigned_user'].value?.length > 0
          ? this.formGroup.controls['assigned_user'].value
          : filtros['assigned_user'] || null,
      page: this.page,
      page_size: this.rows,
    };
  }

  protected convertDates(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  protected getRequestListByFilter(payload: FilterRequestsAfiliation): void {
    this.userService.getRequestAfiliationListByFilter(payload).subscribe({
      next: (response: BodyResponse<RequestsListAfiliation[]>) => {
        if (response.code === 200) {
          this.requestList = response.data;
          console.log(this.requestList);
          this.requestList = response.data.map(item => {
            const transformedDate = formatDate(item.filing_date, 'MM/dd/yyyy', 'en-US');
            return { ...item, filing_date: transformedDate };
          });
          this.totalRows = Number(response.message);
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: unknown) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }

  protected showSuccessMessage(state: string, title: string, message: string): void {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }

  getRequestStatusList(): void {
    this.userService.getRequestAfiliationStatusList().subscribe({
      next: (response: BodyResponse<RequestStatusAfiliationList[]>) => {
        if (response.code === 200) {
          this.statusList = response.data;
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: unknown) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }

  getUsersList(): void {
    this.userService.getUsersListAfiliaciones().subscribe({
      next: (response: BodyResponse<UserList[]>) => {
        if (response.code === 200) {
          this.userList = response.data;
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: unknown) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }

  getColor(value: number): string {
    if (value >= 0 && value < 4) {
      return '#01b0ef';
    }
    return 'red';
  }

  onPageChange(event: PaginatorState): void {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;

    sessionStorage.getItem('filtrosBusqueda');
    this.searchRequests();
  }

  cleanForm(): void {
    sessionStorage.removeItem('filtrosBusqueda');

    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.formGroup.reset();
    this.requestList = [];
    this.searchRequests();
  }

  initPaginador(): void {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.searchRequests();
  }

  redirectDetails(id: number): void {
    console.log(id);
    let filtros = this.formGroup.value;

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
    this.router.navigate([RoutesApp.REQUEST_DETAILS_AFILIATION, id]);
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnterKeyPressed(event: Event): void {
    const isOverlayOpen =
      document.querySelector('.p-overlay-visible') || document.querySelector('.cdk-overlay-pane');

    const hasActiveFilters = Object.values(this.formGroup.value).some(
      value =>
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
    );

    if (!isOverlayOpen && hasActiveFilters) {
      event.preventDefault();
      this.initPaginador();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKeyPressed(event: Event): void {
    const isOverlayOpen =
      document.querySelector('.p-overlay-visible') || document.querySelector('.cdk-overlay-pane');

    if (!isOverlayOpen) {
      event.preventDefault();
      this.cleanForm();
    }
  }
}
