import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  ApplicantTypeList,
  FilterRequests,
  RequestStatusList,
  RequestTypeList,
  RequestsList,
  RequestsReview,
  UserList,
  RequestAreaList,
} from '../../../models/users.interface';
import { RoutesApp } from '../../../enums/routes.enum';
import { MessageService } from 'primeng/api';
import { SessionStorageItems } from '../../../enums/session-storage-items.enum';
import { formatDate } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';
import { PaginatorState } from 'primeng/paginator';
import { PageEvent } from '../../../models/shared/page-event.interface';
import { forkJoin } from 'rxjs';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-process-request',
  templateUrl: './process-request.component.html',
  styleUrl: './process-request.component.scss',
})
export class ProcessRequestComponent implements OnInit {
  requestList: RequestsList[] = [];
  requestListByAssigned: RequestsList[] = [];
  aplicantList: ApplicantTypeList[] = [];
  requestTypeList: RequestTypeList[] = [];
  userList: UserList[] = [];
  requestAreaList: RequestAreaList[] = [];
  requestUserList: UserList[] = [];
  ingredient!: string;
  parameter = [''];
  request_details!: RequestsReview;
  selectedRequests: RequestsList[] = [];
  selectedRequestsAssigned: RequestsList[] = [];
  informative: boolean = false;
  filterForm: FormGroup<any> = new FormGroup<any>({});
  filterFormAssigned: FormGroup<any> = new FormGroup<any>({});
  statusList: RequestStatusList[] = [];
  buttonmsg = '';
  visibleDialogInput = false;
  message = '';
  message2 = '';
  severity = '';
  enableAssign: boolean = false;

  visibleDialogAlert = false;
  statusOptions!: string[];
  daysOption!: number[];
  selectedDaysOptions!: number[];
  selectedStatusOptions!: string[];
  user: string = '';

  //paginador
  first: number = 0;
  page: number = 1;
  rows: number = 10;
  totalRows: number = 0;

  //paginadorAssigned
  firstAssigned: number = 0;
  pageAssigned: number = 1;
  rowsAssigned: number = 10;
  totalRowsAssigned: number = 0;
  
  PERFIL!: string;
  isBulkAssign: boolean = false; // Saber si es masivo o no
  request_details_process!: RequestsList;
  visibleAssignedInput = false;
  @ViewChild('dt') table!: Table;

  priorityLevelList = [
    { name: 'Sin prioridad', value: 0 },
    { name: 'Prioridad baja', value: 1 },
    { name: 'Prioridad alta', value: 2 }
  ];

  constructor(
    private userService: Users,
    private router: Router,
    private messageService: MessageService
  ) {
    this.filterForm = new FormGroup({
      dates_range: new FormControl(null),
      filing_number: new FormControl(null),
      doc_id: new FormControl(null),
      applicant_name: new FormControl(null),
      request_days: new FormControl(null),
      applicant_type_id: new FormControl(null),
      request_type_id: new FormControl(null),
      assigned_user: new FormControl(null),
      //request_status_id: new FormControl(null),
      request_status_id: new FormControl([1]),
      confa_user: new FormControl(null),
      area_name: new FormControl(null),
      //is_priority: new FormControl(null),
      priority_level: new FormControl(null),
    });
    this.filterFormAssigned = new FormGroup({
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
      priority_level: new FormControl(null),
    });
    this.filterForm.get('request_status_id')?.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.filterForm.get('request_status_id')?.setValue(null);
      }
    });
    this.filterForm.get('applicant_type_id')?.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.filterForm.get('applicant_type_id')?.setValue(null);
      }
    });
    this.filterForm.get('assigned_user')?.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.filterForm.get('assigned_user')?.setValue(null);
      }
    });
    this.filterForm.get('request_type_id')?.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.filterForm.get('request_type_id')?.setValue(null);
      }
    });
    this.filterFormAssigned.get('request_status_id')?.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.filterFormAssigned.get('request_status_id')?.setValue(null);
      }
    });
    this.filterFormAssigned.get('applicant_type_id')?.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.filterFormAssigned.get('applicant_type_id')?.setValue(null);
      }
    });
    this.filterFormAssigned.get('assigned_user')?.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.filterFormAssigned.get('assigned_user')?.setValue(null);
      }
    });
    this.filterFormAssigned.get('request_type_id')?.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.filterFormAssigned.get('request_type_id')?.setValue(null);
      }
    });
  }

  ngOnInit() {
    this.PERFIL = sessionStorage.getItem(SessionStorageItems.PERFIL) || '';
    this.user = sessionStorage.getItem(SessionStorageItems.USER) || '';
    this.searhRequests();
    this.searhRequestsAssignedUser();
    this.getApplicantTypeList();
    this.getRequestTypeList();
    this.getUsersList();
    this.getRequestStatusList();
    this.getRequestUserList();
    this.getRequestAreasList();
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
    this.searhRequests();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.filterForm.reset();
    this.requestList = [];
    this.searhRequests();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.searhRequests();
  }

  onPageChangeAssigned(eventAssigned1: PageEvent) {
    this.firstAssigned = eventAssigned1.first || 0;
    this.rowsAssigned = eventAssigned1.rows || 0;
    this.pageAssigned = Number(eventAssigned1.page) + 1 || 0;
    this.searhRequestsAssignedUser();
  }
  cleanFormAssigned() {
    this.firstAssigned = 0;
    this.pageAssigned = 1;
    this.rowsAssigned = 10;
    this.filterFormAssigned.reset();
    this.requestListByAssigned = [];
    this.searhRequestsAssignedUser();
  }

  initPaginadorAssigned() {
    this.firstAssigned = 0;
    this.pageAssigned = 1;
    this.rowsAssigned = 10;
    this.searhRequestsAssignedUser();
  }

  searhRequests() {
    const payload: FilterRequests = {
      i_date:
        this.filterForm.controls['dates_range'].value == null
          ? null
          : this.convertDates(this.filterForm.controls['dates_range']?.value[0] || null),
      f_date:
        this.filterForm.controls['dates_range']?.value == null
          ? null
          : this.convertDates(this.filterForm.controls['dates_range']?.value[1] || null),
      filing_number: this.filterForm.controls['filing_number'].value || null,
      doc_id: this.filterForm.controls['doc_id'].value || null,
      applicant_name: this.filterForm.controls['applicant_name'].value || null,
      request_days: this.filterForm.controls['request_days'].value || null,
      applicant_type_id: this.filterForm.controls['applicant_type_id'].value || null,
      request_type_id: this.filterForm.controls['request_type_id'].value || null,
      assigned_user: this.filterForm.controls['assigned_user'].value || null,
      status_id: this.filterForm.controls['request_status_id'].value || null,
      //is_priority: this.filterForm.controls['is_priority'].value || null,
      priority_level: this.filterForm.controls['priority_level'].value,
      confa_user: this.filterForm.controls['confa_user'].value || null,
      area_name: this.filterForm.controls['area_name'].value || null,

      page: this.page,
      page_size: this.rows,
    };
    this.getRequestListByFilter(payload);
  }
  getRequestListByFilter(payload: FilterRequests) {
    this.userService.getRequestListByFilter(payload).subscribe({
      next: (response: BodyResponse<RequestsList[]>) => {
        if (response.code === 200) {
          this.requestList = response.data;
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
  convertDates(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }
  searhRequestsAssignedUser() {
    const payload: FilterRequests = {
      i_date:
        this.filterFormAssigned.controls['dates_range'].value == null
          ? null
          : this.convertDates(this.filterFormAssigned.controls['dates_range']?.value[0] || null),
      f_date:
        this.filterFormAssigned.controls['dates_range']?.value == null
          ? null
          : this.convertDates(this.filterFormAssigned.controls['dates_range']?.value[1] || null),
      filing_number: this.filterFormAssigned.controls['filing_number'].value || null,
      doc_id: this.filterFormAssigned.controls['doc_id'].value || null,
      applicant_name: this.filterFormAssigned.controls['applicant_name'].value || null,
      request_days: this.filterFormAssigned.controls['request_days'].value || null,
      applicant_type_id: this.filterFormAssigned.controls['applicant_type_id'].value || null,
      request_type_id: this.filterFormAssigned.controls['request_type_id'].value || null,
      status_id: this.filterFormAssigned.controls['request_status_id'].value || null,
      priority_level: this.filterFormAssigned.controls['priority_level'].value || null,
      confa_user: this.filterFormAssigned.controls['confa_user'].value || null,
      area_name: this.filterFormAssigned.controls['area_name'].value || null,
      page: this.pageAssigned,
      page_size: this.rowsAssigned,
    };

    this.getRequestListByAssignedUserByFilter(payload);
  }
  getRequestListByAssignedUserByFilter(payload: FilterRequests) {
    console.log(payload);
    this.userService.getRequestListByAssignedUser(this.user, payload).subscribe({
      next: (response: BodyResponse<RequestsList[]>) => {
        if (response.code === 200) {
          this.requestListByAssigned = response.data;
          this.daysOption = Array.from(
            new Set(this.requestListByAssigned.map(item => item.request_days))
          );
          this.statusOptions = Array.from(
            new Set(this.requestListByAssigned.map(item => item.status_name))
          );
          this.requestListByAssigned = response.data.map(item => {
            const transformedDate = formatDate(item.filing_date, 'MM/dd/yyyy', 'en-US');
            return { ...item, filing_date: transformedDate };
          });
          this.requestListByAssigned.forEach(item => {
            if (typeof item.filing_date === 'string') {
              item.filing_date_date = new Date(item.filing_date);
            }
          });
          this.totalRowsAssigned = Number(response.message);
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

  redirectDetails(request_id: number) {
    localStorage.removeItem('route');
    localStorage.setItem('route', this.router.url);
    this.router.navigate([RoutesApp.REQUEST_DETAILS, request_id]);
  }

  //Metodos para nuevos metodos en revision
  assignStateReviewRequest(request_details: RequestsReview) {
    console.log(request_details);
    this.buttonmsg = 'En Revisión';
    this.message = 'Cambiar estado a "En revisión"';
    this.visibleDialogInput = true;
    this.request_details = request_details;
  }
  closeDialogInput(value: boolean) {
    this.visibleDialogInput = false;
    this.enableAssign = value;
    if (value) {
      // accion de eliminar
    }
  }
  setParameter(inputValue: { mensssajeReview: string }) {
    if (!this.enableAssign) return;
    this.request_details['mensaje_revision'] = inputValue.mensssajeReview;

    if (inputValue) {
      this.userService.changeStateReview(this.request_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
          }
        },
        error: (err: any) => {
          console.log(err);
        },
        complete: () => {
          this.ngOnInit();
          console.log('La suscripción ha sido completada.');
        },
      });
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault(); // Evita que se envíe el formulario
      this.initPaginadorAssigned();
    }
    if (event.key === 'Escape') {
      this.cleanForm();
    }
  }

  activeTabIndex = 0; // 0 para "Asignadas", 1 para "Generales"

@HostListener('document:keydown.enter', ['$event'])
onEnterPressed(event: KeyboardEvent): void {
  if (this.activeTabIndex === 0 && this.hasActiveFilters(this.filterFormAssigned)) {
    event.preventDefault();
    this.initPaginadorAssigned();
  } else if (this.activeTabIndex === 1 && this.hasActiveFilters(this.filterForm)) {
    event.preventDefault();
    this.initPaginador();
  }
}

@HostListener('document:keydown.escape', ['$event'])
onEscapePressed(event: KeyboardEvent): void {
  if (this.activeTabIndex === 0) {
    event.preventDefault();
    this.cleanFormAssigned();
  } else if (this.activeTabIndex === 1) {
    event.preventDefault();
    this.cleanForm();
  }
}

private hasActiveFilters(formGroup: FormGroup): boolean {
  return Object.values(formGroup.value).some(value => {
    if (value === null || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
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
    this.visibleAssignedInput = true;
    this.parameter = ['Colaborador'];
    this.request_details_process = request_details;
  }

  setParameterAssigned(inputValue: {
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
        request.request_status = 3;
  
        return this.userService.assignUserToRequest(request);
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
      if (this.request_details_process.assigned_user === inputValue.userName) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Verifique el responsable a asignar';
        this.message2 = 'Debe seleccionar un colaborador diferente';
        this.severity = 'danger';
        return;
      }
  
      this.request_details_process.assigned_user = inputValue.userName;
      this.request_details_process.user_name_completed = inputValue.userNameCompleted;
      this.request_details_process.mensaje_reasignacion = inputValue.mensajeReasignacion;
  
      this.userService.assignUserToRequest(this.request_details_process).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Éxito', 'Asignación exitosa');
          } else {
            this.showSuccessMessage('error', 'Falló', 'Asignación fallida');
          }
        },
        error: (err) => console.error(err),
        complete: () => {
          this.visibleAssignedInput = false;
          this.ngOnInit();
        },
      });
    }
  }

  closeDialogAssignedInput(value: boolean) {
    this.visibleAssignedInput = false;
    this.enableAssign = value;
    if (value) {
      // accion de eliminar
    }
  }
  
  assignSelectedRequests(requests: RequestsList[]) {
    if (!requests || requests.length === 0) return;
    this.isBulkAssign = true;

    this.selectedRequests = requests;

    this.message = 'Reasignar responsable a solicitudes seleccionadas';
    this.buttonmsg = 'Reasignar';
    this.visibleAssignedInput = true;
    this.parameter = ['Colaborador'];
  }
  
}
