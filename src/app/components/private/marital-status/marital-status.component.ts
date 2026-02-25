import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { GenderList, MaritalStatusList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-marital-status',
  templateUrl: './marital-status.component.html',
  styleUrl: './marital-status.component.scss'
})
export class MaritalStatusComponent {
  data!: IRequestManager[];
  genderList!: GenderList[];
  maritalStatusList!: MaritalStatusList[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogMaritalStatus = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  gender_details!: GenderList;
  marital_status_details!: MaritalStatusList;
  enableAction: boolean = false;
  read_only: boolean = false;
  enableCreate: boolean = false;
  informative: boolean = false;
  severity = '';

  //paginador
  first: number = 0;
  page: number = 1;
  rows: number = 10;
  totalRows: number = 0;

  constructor(
    private userService: Users,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.getMaritalStatusTablePagination();
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getMaritalStatusTablePagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getMaritalStatusTablePagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getMaritalStatusTablePagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }
  getMaritalStatusTablePagination() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getMaritalStatusListPagination(payload).subscribe({
      next: (response: BodyResponse<MaritalStatusList[]>) => {
        if (response.code === 200) {
          this.maritalStatusList = response.data;
          this.totalRows = Number(response.message);
          this.maritalStatusList.forEach(item => {
            item.esta_activo = item.esta_activo;
          });
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

  inActiveMaritalStatus(marital_status_details: MaritalStatusList) {
    if (!marital_status_details.esta_activo) {
      this.message = '¿Seguro que desea Inactivar el estado civil?';
      this.visibleDialog = true;
      marital_status_details.esta_activo = false;
    } else {
      this.message = '¿Seguro que desea Activar el género?';
      this.visibleDialog = true;
      marital_status_details.esta_activo = true;
    }
    this.marital_status_details = marital_status_details;
  }
  displayMaritalStatus(marital_status_details: MaritalStatusList) {
    this.visibleDialogMaritalStatus = true;
    this.buttonmsg = '';
    this.message = 'Detalles del estado civil';
    this.read_only = true;
    this.enableCreate = false;
    this.marital_status_details = marital_status_details;
  }
  editMaritalStatus(marital_status_details: MaritalStatusList) {
    this.visibleDialogMaritalStatus = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar el estado civil';
    this.read_only = false;
    this.enableCreate = false;
    this.marital_status_details = marital_status_details;
  }
  createMaritalStatus() {
    this.visibleDialogMaritalStatus = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear estado civil';
    this.read_only = false;
    this.enableCreate = true;
  }

   closeDialogMaritalStatus(value: boolean) {
    this.visibleDialogMaritalStatus = false;
    this.enableAction = value;
    if (value) {
      //
    }
  }

  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAction = value;
  }
  setParameter(marital_status_details: MaritalStatusList) {
     if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      if (this.maritalStatusList.some(obj => obj.estado_civil === marital_status_details.estado_civil)) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe una estado civil con ese nombre ' + marital_status_details.esta_activo;
        this.severity = 'danger';
      } else {
        this.userService.createMaritalStatus(marital_status_details).subscribe({
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
    } else {
      this.userService.modifyMaterialStatus(marital_status_details).subscribe({
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

  closeDialog(value: boolean) {
    this.visibleDialog = false;
    if (value) {
      this.userService.inactivateMaritalStaus(this.marital_status_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            if ((this.marital_status_details.esta_activo = true)) {
              this.marital_status_details.esta_activo = false;
            } else {
              this.marital_status_details.esta_activo = true;
            }
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
    } else {
      this.ngOnInit();
    }
  }
}
