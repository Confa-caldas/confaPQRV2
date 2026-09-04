import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { GenderList, Pagination, ResponsibleList } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-responsible',
  templateUrl: './responsible.component.html',
  styleUrl: './responsible.component.scss'
})
export class ResponsibleComponent {
  data!: IRequestManager[];
  responsibleList!: ResponsibleList[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogCategory = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  responsible_details!: ResponsibleList;
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
    this.getResponsibleTablePagination();
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getResponsibleTablePagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getResponsibleTablePagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getResponsibleTablePagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }
  getResponsibleTablePagination() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getResponsibleListPagination(payload).subscribe({
      next: (response: BodyResponse<ResponsibleList[]>) => {
        if (response.code === 200) {
          this.responsibleList = response.data;
          this.totalRows = Number(response.message);
          this.responsibleList.forEach(item => {
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

  inActiveResponsible(responsible_details: ResponsibleList) {
    if (!responsible_details.esta_activo) {
      this.message = '¿Seguro que desea Inactivar el responsable?';
      this.visibleDialog = true;
      responsible_details.esta_activo = false;
    } else {
      this.message = '¿Seguro que desea Activar el responsable?';
      this.visibleDialog = true;
      responsible_details.esta_activo = true;
    }
    this.responsible_details = responsible_details;
  }
  displayResponsible(responsible_details: ResponsibleList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = '';
    this.message = 'Detalles del responsable';
    this.read_only = true;
    this.enableCreate = false;
    this.responsible_details = responsible_details;
  }
  editResponsible(responsible_details: ResponsibleList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar el responsable';
    this.read_only = false;
    this.enableCreate = false;
    this.responsible_details = responsible_details;
  }
  createResponsible() {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear responsable';
    this.read_only = false;
    this.enableCreate = true;
  }

  closeDialogResponsible(value: boolean) {
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
  setParameter(responsible_details: ResponsibleList) {
     if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      if (this.responsibleList.some(obj => obj.nombre_usuario_red === responsible_details.nombre_usuario_red)) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe un responsable con ese nombre ' + responsible_details.nombre_usuario_red;
        this.severity = 'danger';
      } else {
        this.userService.createResponsible(responsible_details).subscribe({
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
      this.userService.modifyResponsible(responsible_details).subscribe({
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
      this.userService.inactivateResponsible(this.responsible_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            if ((this.responsible_details.esta_activo = true)) {
              this.responsible_details.esta_activo = false;
            } else {
              this.responsible_details.esta_activo = true;
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
