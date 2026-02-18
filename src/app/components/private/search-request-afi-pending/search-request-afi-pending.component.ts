import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  ApplicantTypeList,
  FilterRequestsAfiliation,
  RequestStatusList,
  RequestTypeList,
  RequestsList,
  RequestsListAfiliation,
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
  selector: 'app-search-request-afi-pending',
  templateUrl: './search-request-afi-pending.component.html',
  styleUrl: './search-request-afi-pending.component.scss',
})
export class SearchRequestAfiPendingComponent implements OnInit {
  requestList: RequestsListAfiliation[] = [];
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
  request_details!: RequestsList;
  //selectedRequests!: RequestsList[];
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
  statusList: RequestStatusList[] = [];
  formGroup: FormGroup<any> = new FormGroup<any>({});
  mensajeReasignacion: string = '';
  //paginador
  first: number = 0;
  page: number = 1;
  rows: number = 10;
  totalRows: number = 0;

  solicitudes: any[] = []; // tus datos

  isBulkAssign: boolean = false; // Saber si es masivo o no
  selectedRequests: RequestsList[] = []; // Solicitudes seleccionadas con checkbox
  @ViewChild('dt') table!: Table;

  constructor(
    private userService: Users,
    private router: Router,
    private messageService: MessageService
  ) {
    this.formGroup = new FormGroup({
      filing_number: new FormControl(null),
      dates_range: new FormControl(null),
      doc_id_tr: new FormControl(null),
      doc_id_bn: new FormControl(null),
      applicant_name_emp: new FormControl(null),
      request_status_id: new FormControl([1]),
      assigned_user: new FormControl(null),
    });

    this.formGroup.get('request_status_id')?.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.formGroup.get('request_status_id')?.setValue(null);
      }
    });
    this.formGroup.get('applicant_type_id')?.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.formGroup.get('applicant_type_id')?.setValue(null);
      }
    });
    this.formGroup.get('assigned_user')?.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.formGroup.get('assigned_user')?.setValue(null);
      }
    });
    this.formGroup.get('request_type_id')?.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.formGroup.get('request_type_id')?.setValue(null);
      }
    });
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

    this.searhRequests();
    this.getRequestStatusList();
    this.getUsersList();
    this.loading = false;
  }

  getColor(value: number): string {
    if (value >= 0 && value < 4) {
      return '#01b0ef';
    } else {
      return 'red';
    }
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;

    sessionStorage.getItem('filtrosBusqueda');
    this.searhRequests();
  }
  cleanForm() {
    sessionStorage.removeItem('filtrosBusqueda');

    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.formGroup.reset();
    this.requestList = [];
    this.searhRequests();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.searhRequests();
  }

  searhRequests() {
    const filtrosGuardados = sessionStorage.getItem('filtrosBusqueda');
    let filtros = filtrosGuardados ? JSON.parse(filtrosGuardados) : {};

    const payload: FilterRequestsAfiliation = {
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
        this.formGroup.controls['applicant_name_emp'].value?.trim().length > 0
          ? this.formGroup.controls['applicant_name_emp'].value
          : filtros['applicant_name_emp'] || null,
      status_id:
        this.formGroup.controls['request_status_id'].value &&
        this.formGroup.controls['request_status_id'].value.length > 0
          ? this.formGroup.controls['request_status_id'].value
          : filtros['request_status_id'] || null,
      assigned_user:
        this.formGroup.controls['assigned_user'].value?.length > 0
          ? this.formGroup.controls['assigned_user'].value
          : filtros['assigned_user'] || null,
      page: this.page,
      page_size: this.rows,
    };

    this.getRequestListByFilter(payload);
  }
  convertDates(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }
  getRequestListByFilter(payload: FilterRequestsAfiliation) {
    this.userService.getRequestAfiliationListByFilter(payload).subscribe({
      next: (response: BodyResponse<RequestsListAfiliation[]>) => {
        if (response.code === 200) {
          this.requestList = response.data;
          console.log(this.requestList);
          this.requestList = response.data.map(item => {
            const transformedDate = formatDate(item.fecha_solicitud, 'MM/dd/yyyy', 'en-US');
            return { ...item, filing_date: transformedDate };
          });
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
  getRequestStatusList() {
    this.userService.getRequestStatusList().subscribe({
      next: (response: BodyResponse<RequestStatusList[]>) => {
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

  getUsersList() {
    this.userService.getUsersList().subscribe({
      next: (response: BodyResponse<UserList[]>) => {
        if (response.code === 200) {
          this.userList = response.data;
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

  assignRequest(request_details: RequestsList) {
    this.isBulkAssign = false;

    if (request_details.assigned_user == null || request_details.assigned_user == '') {
      this.message = 'Asignar responsable de solicitud';
      this.buttonmsg = 'Asignar';
      request_details.request_status = 2;
    } else {
      this.message = 'Reasignar responsable de solicitud';
      this.buttonmsg = 'Reasignar';
      request_details.request_status = 3;
    }
    this.visibleDialogInput = true;
    this.parameter = ['Colaborador'];
    this.request_details = request_details;
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
        request.assigned_user = inputValue.userName;
        request.user_name_completed = inputValue.userNameCompleted;
        request.mensaje_reasignacion = inputValue.mensajeReasignacion;
        request.request_status = 2;
  
        return this.userService.assignUserToRequestAfiliation(request);
      });
  
      forkJoin(requestsToAssign).subscribe({
        next: (responses) => {
          responses.forEach((response, index) => {
            const filingNumber = this.selectedRequests[index]?.filing_number || 'Desconocido';
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
        next: (response) => {
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

  assignSelectedRequests(requests: RequestsList[]) {
    if (!requests || requests.length === 0) return;

    this.isBulkAssign = true;
    this.selectedRequests = requests;

    this.message = 'Asignar responsable a solicitudes seleccionadas';
    this.buttonmsg = 'Asignar';
    this.parameter = ['Colaborador'];
    this.visibleDialogInput = true;
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnterKeyPressed(event: KeyboardEvent): void {
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
  onEscapeKeyPressed(event: KeyboardEvent): void {
    const isOverlayOpen =
      document.querySelector('.p-overlay-visible') || document.querySelector('.cdk-overlay-pane');

    // Solo limpiar si no hay overlays abiertos (para no interferir con selección)
    if (!isOverlayOpen) {
      event.preventDefault();
      this.cleanForm();
    }
  }

}
