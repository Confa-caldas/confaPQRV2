import { Component } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { ReasonAccountUpdateList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-reason-account-update',
  templateUrl: './reason-account-update.component.html',
  styleUrl: './reason-account-update.component.scss'
})
export class ReasonAccountUpdateComponent {
  data!: IRequestManager[];
  reasonAccountUpdateList!: ReasonAccountUpdateList[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogReasonAccountUpdate = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  reasonAccountUpdate_details!: ReasonAccountUpdateList;
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
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.getReasonAccountUpdateTablePagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getReasonAccountUpdateTablePagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getReasonAccountUpdateTablePagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getReasonAccountUpdateTablePagination();
  }

  getReasonAccountUpdateTablePagination() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getReasonAccountUpdateListPagination(payload).subscribe({
      next: (response: BodyResponse<ReasonAccountUpdateList[]>) => {
        if (response.code === 200) {
          this.reasonAccountUpdateList = response.data;
          this.totalRows = Number(response.message);
          this.reasonAccountUpdateList.forEach(item => {
            item.is_active = item.is_active === 1 ? true : false;
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
  inActiveReasonAccountUpdate(reasonAccountUpdate_details: ReasonAccountUpdateList) {
    if (!reasonAccountUpdate_details.is_active) {
      this.message = '¿Seguro que desea Inactivar el motivo de actualización de cuenta?';
      this.visibleDialog = true;
      reasonAccountUpdate_details.is_active = 0;
    } else {
      this.message = '¿Seguro que desea Activar el motivo de actualización de cuenta?';
      this.visibleDialog = true;
      reasonAccountUpdate_details.is_active = 1;
    }
    this.reasonAccountUpdate_details = reasonAccountUpdate_details;
  }
  displayReasonAccountUpdate(reasonAccountUpdate_details: ReasonAccountUpdateList) {
    this.visibleDialogReasonAccountUpdate = true;
    this.buttonmsg = '';
    this.message = 'Detalles de motivo de actualización de cuenta';
    this.read_only = true;
    this.enableCreate = false;
    this.reasonAccountUpdate_details = reasonAccountUpdate_details;
  }
  editReasonAccountUpdate(reasonAccountUpdate_details: ReasonAccountUpdateList) {
    this.visibleDialogReasonAccountUpdate = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar motivo de actualización de cuenta';
    this.read_only = false;
    this.enableCreate = false;
    this.reasonAccountUpdate_details = reasonAccountUpdate_details;
  }
  createReasonAccountUpdate() {
    this.visibleDialogReasonAccountUpdate = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear motivo de actualización de cuenta';
    this.read_only = false;
    this.enableCreate = true;
  }

  closeDialogReasonAccountUpdate(value: boolean) {
    this.visibleDialogReasonAccountUpdate = false;
    this.enableAction = value;
    if (value) {
      //
    }
  }
  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAction = value;
  }

  setParameter(reasonAccountUpdate_details: ReasonAccountUpdateList) {
    if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      if (this.reasonAccountUpdateList.some(obj => obj.reason.toLowerCase() === reasonAccountUpdate_details.reason.toLowerCase())) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe un motivo con ese nombre: ' + reasonAccountUpdate_details.reason;
        this.severity = 'danger';
      } else {
        this.userService.createReasonAccountUpdateList(reasonAccountUpdate_details).subscribe({
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
      this.userService.modifyReasonAccountUpdate(reasonAccountUpdate_details).subscribe({
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
    this.ngOnInit();
  }

  closeDialog(value: boolean) {
    this.visibleDialog = false;
    if (value) {
      this.userService.inactivateReasonAccountUpdate(this.reasonAccountUpdate_details).subscribe({
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
    this.ngOnInit();
  }
}
