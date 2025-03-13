import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  ApplicantTypeList,
  FilterRequestsIntern,
  RequestStatusList,
  RequestTypeList,
  RequestsList,
  UserList,
  RequestAreaList,
  RequestsListIntern,
  IsPriority,
} from '../../../models/users.interface';
import { RoutesApp } from '../../../enums/routes.enum';
import { MessageService } from 'primeng/api';
import { formatDate } from '@angular/common';
import { SessionStorageItems } from '../../../enums/session-storage-items.enum';
import { FormControl, FormGroup } from '@angular/forms';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-intern-search-request',
  templateUrl: './intern-search-request.component.html',
  styleUrl: './intern-search-request.component.scss',
})
export class InternSearchRequestComponent implements OnInit {
  requestList: RequestsListIntern[] = [];
  aplicantList: ApplicantTypeList[] = [];
  requestTypeList: RequestTypeList[] = [];
  userList: UserList[] = [];
  requestUserList: UserList[] = [];
  requestAreaList: RequestAreaList[] = [];

  ingredient!: string;
  visibleDialog = false;
  visibleDialogInput = false;
  message = '';
  message2 = '';
  buttonmsg = '';
  parameter = [''];
  request_details!: RequestsList;
  selectedRequests!: RequestsList[];
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

  isPriorityList: IsPriority[] = [];

  constructor(
    private userService: Users,
    private router: Router,
    private messageService: MessageService
  ) {
    this.formGroup = new FormGroup({
      dates_range: new FormControl(null),
      filing_number: new FormControl(null),
      doc_id: new FormControl(null),
      applicant_name: new FormControl(null),
      request_days: new FormControl(null),
      applicant_type_id: new FormControl(null),
      request_type_id: new FormControl(null),
      assigned_user: new FormControl(null),
      request_status_id: new FormControl(null),
      confa_user: new FormControl(null),
      area_name: new FormControl(null),
      is_priority: new FormControl(null),
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
          // if (filtros.assigned_user && !Array.isArray(filtros.assigned_user)) {
          //   filtros.assigned_user = [filtros.assigned_user]; // Convertir en array si no lo es
          // }

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

    this.isPriorityList = [
      {
        value: true,
        name: 'Sí',
      },
      {
        value: false,
        name: 'No',
      },
    ];
    this.PERFIL = sessionStorage.getItem(SessionStorageItems.PERFIL) || '';

    this.searhRequestsIntern();
    this.getRequestStatusList();
    this.getApplicantTypeList();
    this.getRequestTypeList();
    this.getRequestUserList();
    this.getRequestAreasList();

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
    this.searhRequestsIntern();
  }
  cleanForm() {
    sessionStorage.removeItem('filtrosBusqueda');

    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.formGroup.reset();
    this.requestList = [];
    this.searhRequestsIntern();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.searhRequestsIntern();
  }

  searhRequestsIntern() {
    const filtrosGuardados = sessionStorage.getItem('filtrosBusqueda');
    let filtros = filtrosGuardados ? JSON.parse(filtrosGuardados) : {};

    const payload: FilterRequestsIntern = {
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
      doc_id:
        this.formGroup.controls['doc_id'].value &&
        this.formGroup.controls['doc_id'].value.length > 0
          ? this.formGroup.controls['doc_id'].value
          : filtros['doc_id'] || null,
      applicant_type_id:
        this.formGroup.controls['applicant_type_id'].value &&
        this.formGroup.controls['applicant_type_id'].value > 0
          ? this.formGroup.controls['applicant_type_id'].value
          : filtros['applicant_type_id'] || null,
      request_type_id:
        this.formGroup.controls['request_type_id'].value &&
        this.formGroup.controls['request_type_id'].value > 0
          ? this.formGroup.controls['request_type_id'].value
          : filtros['request_type_id'] || null,
      status_id:
        this.formGroup.controls['request_status_id'].value &&
        this.formGroup.controls['request_status_id'].value.length > 0
          ? this.formGroup.controls['request_status_id'].value
          : filtros['request_status_id'] || null,
      is_priority: this.formGroup.controls['is_priority'].value || null,
      confa_user: this.formGroup.controls['confa_user'].value || null,
      area_name: this.formGroup.controls['area_name'].value || null,

      page: this.page,
      page_size: this.rows,
    };

    this.getRequestListByFilterIntern(payload);
  }
  convertDates(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  getRequestListByFilterIntern(payload: FilterRequestsIntern) {
    this.userService.getRequestListInternByFilter(payload).subscribe({
      next: (response: BodyResponse<RequestsListIntern[]>) => {
        if (response.code === 200) {
          this.requestList = response.data;
          console.log(this.requestList);
          this.daysOption = Array.from(new Set(this.requestList.map(item => item.request_days)));
          this.statusOptions = Array.from(new Set(this.requestList.map(item => item.status_name)));
          this.requestList = response.data.map(item => {
            const transformedDate = formatDate(item.filing_date, 'MM/dd/yyyy', 'en-US');
            return { ...item, filing_date: transformedDate };
          });
          this.requestList.forEach(item => {
            if (typeof item.filing_date === 'string') {
              item.filing_date_date = new Date(item.filing_date);
            }
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

  getApplicantTypeList() {
    this.userService.getApplicantTypesList().subscribe({
      next: (response: BodyResponse<ApplicantTypeList[]>) => {
        if (response.code === 200) {
          this.aplicantList = response.data.filter(obj => obj.is_active !== 0);
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

  getRequestTypeList() {
    this.userService.getRequestTypesList().subscribe({
      next: (response: BodyResponse<RequestTypeList[]>) => {
        if (response.code === 200) {
          this.requestTypeList = response.data;
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

  // Metodo para listar los usuarios que han hecho radicados
  getRequestUserList() {
    this.userService.getRequestUserList().subscribe({
      next: (response: BodyResponse<UserList[]>) => {
        if (response.code === 200) {
          this.requestUserList = response.data;
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

  // Metodo para listar las areas
  getRequestAreasList() {
    this.userService.getRequestAreasList().subscribe({
      next: (response: BodyResponse<RequestAreaList[]>) => {
        if (response.code === 200) {
          this.requestAreaList = response.data;
          console.log(this.requestUserList, 'areas');
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
    this.router.navigate([RoutesApp.REQUEST_DETAILS, request_id]);
  }

  // redirectDetails(request_id: number) {
  //   localStorage.removeItem('route');
  //   localStorage.setItem('route', this.router.url);
  //   this.router.navigate([RoutesApp.REQUEST_DETAILS, request_id]);
  // }
}
