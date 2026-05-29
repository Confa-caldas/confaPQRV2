import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { EntityAccountTypeList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-entity-account-type',
  templateUrl: './entity-account-type.component.html',
  styleUrl: './entity-account-type.component.scss'
})
export class EntityAccountTypeComponent {
  data!: IRequestManager[];
  entityAccountTypeList!: EntityAccountTypeList[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogEntityAccountType = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  entityAccountType_details!: EntityAccountTypeList;
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
    this.getEntityAccountTypeTablePagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getEntityAccountTypeTablePagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getEntityAccountTypeTablePagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getEntityAccountTypeTablePagination();
  }

  getEntityAccountTypeTablePagination() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getEntityAccountTypeListPagination(payload).subscribe({
      next: (response: BodyResponse<EntityAccountTypeList[]>) => {
        if (response.code === 200) {
          this.entityAccountTypeList = response.data;
          this.totalRows = Number(response.message);
          this.entityAccountTypeList.forEach(item => {
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

  inActiveEntityAccountType(entityAccountType_details: EntityAccountTypeList) {
    if (!entityAccountType_details.is_active) {
      this.message = '¿Seguro que desea Inactivar tipo de cuenta y entidad?';
      this.visibleDialog = true;
      entityAccountType_details.is_active = 0;
    } else {
      this.message = '¿Seguro que desea Activar tipo de cuenta y entidad?';
      this.visibleDialog = true;
      entityAccountType_details.is_active = 1;
    }
    this.entityAccountType_details = entityAccountType_details;
  }

  displayEntityAccountType(entityAccountType_details: EntityAccountTypeList) {
    this.visibleDialogEntityAccountType = true;
    this.buttonmsg = '';
    this.message = 'Detalles de tipo de cuenta y entidad';
    this.read_only = true;
    this.enableCreate = false;
    this.entityAccountType_details = entityAccountType_details;
  }

  editEntityAccountType(entityAccountType_details: EntityAccountTypeList) {
    this.visibleDialogEntityAccountType = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar tipo de cuenta y entidad';
    this.read_only = false;
    this.enableCreate = false;
    this.entityAccountType_details = entityAccountType_details;
  }

  createEntityAccountType() {
    this.visibleDialogEntityAccountType = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear tipo de cuenta y entidad';
    this.read_only = false;
    this.enableCreate = true;
  }

  closeDialogEntityAccountType(value: boolean) {
    this.visibleDialogEntityAccountType = false;
    this.enableAction = value;
    if (value) {
      //
    }
  }

  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAction = value;
  }

  setParameter(entityAccountType_details: EntityAccountTypeList) {
    if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      if (this.entityAccountTypeList.some(obj => obj.entity_id === entityAccountType_details.entity_id && obj.account_type_id === entityAccountType_details.account_type_id)) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe un registro con la misma entidad y tipo de cuenta';
        this.severity = 'danger';
      } else {
        this.userService.createEntityAccountType(entityAccountType_details).subscribe({
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
      this.userService.modifyEntityAccountType(entityAccountType_details).subscribe({
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
      this.userService.inactivateEntityAccountType(this.entityAccountType_details).subscribe({
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
