import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { AccountTypeList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-account-type',
  templateUrl: './account-type.component.html',
  styleUrl: './account-type.component.scss',
})
export class AccountTypeComponent {
  data!: IRequestManager[];
  accountTypeList!: AccountTypeList[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogAccountType = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  account_type_details!: AccountTypeList;
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
    this.getAccountTypeTablePagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getAccountTypeTablePagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getAccountTypeTablePagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getAccountTypeTablePagination();
  }

  getAccountTypeTablePagination() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getAccountTypeListPagination(payload).subscribe({
      next: (response: BodyResponse<AccountTypeList[]>) => {
        if (response.code === 200) {
          this.accountTypeList = response.data;
          this.totalRows = Number(response.message);
          this.accountTypeList.forEach(item => {
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
  inActiveAccountType(account_type_details: AccountTypeList) {
    if (!account_type_details.is_active) {
      this.message = '¿Seguro que desea Inactivar el tipo de cuenta?';
      this.visibleDialog = true;
      account_type_details.is_active = 0;
    } else {
      this.message = '¿Seguro que desea Activar el tipo de cuenta?';
      this.visibleDialog = true;
      account_type_details.is_active = 1;
    }
    this.account_type_details = account_type_details;
  }
  displayAccountType(account_type_details: AccountTypeList) {
    this.visibleDialogAccountType = true;
    this.buttonmsg = '';
    this.message = 'Detalles de tipo de cuenta';
    this.read_only = true;
    this.enableCreate = false;
    this.account_type_details = account_type_details;
  }
  editAccountType(account_type_details: AccountTypeList) {
    this.visibleDialogAccountType = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar tipo de cuenta';
    this.read_only = false;
    this.enableCreate = false;
    this.account_type_details = account_type_details;
  }  
  createAccountType() {
    this.visibleDialogAccountType = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear tipo de cuenta';
    this.read_only = false;
    this.enableCreate = true;
  }

  closeDialogAccountType(value: boolean) {
    this.visibleDialogAccountType = false;
    this.enableAction = value;
    if (value) {
      //
    }
  }
  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAction = value;
  }  

setParameter(account_type_details: AccountTypeList) {
    if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      if (this.accountTypeList.some(obj => obj.account_type_name.toLowerCase() === account_type_details.account_type_name.toLowerCase())) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe tipo de cuenta con nombre ' + account_type_details.account_type_name;
        this.severity = 'danger';
      } else {
        this.userService.createAccountType(account_type_details).subscribe({
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
      this.userService.modifyAccountType(account_type_details).subscribe({
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
      this.userService.inactivateAccountType(this.account_type_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else if (response.code === 409 && response.data === 'ACCOUNT_TYPE_IN_USE') {
            this.visibleDialogAlert = true;
            this.informative = true;
            this.message = 'El tipo de cuenta no puede inactivarse porque está siendo utilizada en PARAMETRIZAR CUENTA Y ENTIDAD';
            this.severity = 'danger';
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
