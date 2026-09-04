import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { AfiNotificationList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-afiliation-notifications',
  templateUrl: './afiliation-notifications.component.html',
  styleUrl: './afiliation-notifications.component.scss'
})
export class AfiliationNotificationsComponent {
  data!: IRequestManager[];
  afiNotificationsList!: AfiNotificationList[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogCategory = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  afiNotifications_details!: AfiNotificationList;
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
    this.getGenderTablePagination();
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getGenderTablePagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getGenderTablePagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getGenderTablePagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }
  getGenderTablePagination() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getAfiNotificationListPagination(payload).subscribe({
      next: (response: BodyResponse<AfiNotificationList[]>) => {
        if (response.code === 200) {
          this.afiNotificationsList= response.data;
          this.totalRows = Number(response.message);
          this.afiNotificationsList.forEach(item => {
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

  inActiveAfiNotifications(afiNotifications_details: AfiNotificationList) {
    if (!afiNotifications_details.esta_activo) {
      this.message = '¿Seguro que desea Inactivar la notificación?';
      this.visibleDialog = true;
      afiNotifications_details.esta_activo = false;
    } else {
      this.message = '¿Seguro que desea Activar la notificación?';
      this.visibleDialog = true;
      afiNotifications_details.esta_activo = true;
    }
    this.afiNotifications_details = afiNotifications_details;
  }
  displayAfiNotifications(afiNotifications_details: AfiNotificationList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = '';
    this.message = 'Detalles de la notificación';
    this.read_only = true;
    this.enableCreate = false;
    this.afiNotifications_details = afiNotifications_details;
  }
  editAfiNotifications(afiNotifications_details: AfiNotificationList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar la notificación';
    this.read_only = false;
    this.enableCreate = false;
    this.afiNotifications_details = afiNotifications_details;
  }
  createAfiNotifications() {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear la notificación';
    this.read_only = false;
    this.enableCreate = true;
  }

  closeDialogAfiNotifications(value: boolean) {
    this.visibleDialogCategory = false;
    this.enableAction = value;
    if (value) {
      //
    }
  }

  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAction = value;
  }
  setParameter(afiNotifications_details: AfiNotificationList) {
     if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      if (this.afiNotificationsList.some(obj => obj.nombre_mensaje === afiNotifications_details.nombre_mensaje)) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe una notificación con ese nombre ' + afiNotifications_details.nombre_mensaje;
        this.severity = 'danger';
      } else {
        this.userService.createAfiNotification(afiNotifications_details).subscribe({
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
      this.userService.modifyAfiNotification(afiNotifications_details).subscribe({
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
      this.userService.inactivateAfiNotification(this.afiNotifications_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            if ((this.afiNotifications_details.esta_activo = true)) {
              this.afiNotifications_details.esta_activo = false;
            } else {
              this.afiNotifications_details.esta_activo = true;
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
