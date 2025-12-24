import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { EntityList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrl: './entity.component.scss'
})
export class EntityComponent {
  data!: IRequestManager[];
  entityList!: EntityList[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogEntity = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  entity_details!: EntityList;
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
    this.getEntityTablePagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getEntityTablePagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getEntityTablePagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getEntityTablePagination();
  }  

getEntityTablePagination() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getEntityListPagination(payload).subscribe({
      next: (response: BodyResponse<EntityList[]>) => {
        if (response.code === 200) {
          this.entityList = response.data;
          this.totalRows = Number(response.message);
          this.entityList.forEach(item => {
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

  inActiveEntity(entity_details: EntityList) {
    if (!entity_details.is_active) {
      this.message = '¿Seguro que desea Inactivar entidad?';
      this.visibleDialog = true;
      entity_details.is_active = 0;
    } else {
      this.message = '¿Seguro que desea Activar la entidad?';
      this.visibleDialog = true;
      entity_details.is_active = 1;
    }
    this.entity_details = entity_details;
  } 

  displayEntity(entity_details: EntityList) {
    this.visibleDialogEntity = true;
    this.buttonmsg = '';
    this.message = 'Detalles de entidad';
    this.read_only = true;
    this.enableCreate = false;
    this.entity_details = entity_details;
  }
  editEntity(entity_details: EntityList) {
    this.visibleDialogEntity = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar entidad';
    this.read_only = false;
    this.enableCreate = false;
    this.entity_details = entity_details;
  }
  createEntity() {
    this.visibleDialogEntity = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear entidad';
    this.read_only = false;
    this.enableCreate = true;
  }

  closeDialogEntity(value: boolean) {
    this.visibleDialogEntity = false;
    this.enableAction = value;
    if (value) {
      //
    }
  }
  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAction = value;
  }

  setParameter(entity_details: EntityList) {
    if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      if (this.entityList.some(obj => obj.entity_code === entity_details.entity_code)) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe una entidad con código ' + entity_details.entity_code;
        this.severity = 'danger';
      } else {
        this.userService.createEntity(entity_details).subscribe({
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
      this.userService.modifyEntity(entity_details).subscribe({
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
      this.userService.inactivateEntity(this.entity_details).subscribe({
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
