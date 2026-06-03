import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { AccountTypeListAfi, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-afiliation-account-type',
  templateUrl: './afiliation-account-type.component.html',
  styleUrl: './afiliation-account-type.component.scss'
})
export class AfiliationAccountTypeComponent {
  data!: IRequestManager[];
  accountTypeListAfi!: AccountTypeListAfi[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogCategory = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  accountType_details!: AccountTypeListAfi;
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
    this.getAccountTypeTablePagination();
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
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }
  getAccountTypeTablePagination() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getAccountTypeListPagination(payload).subscribe({
      next: (response: BodyResponse<AccountTypeListAfi[]>) => {
        if (response.code === 200) {
          this.accountTypeListAfi = response.data;
          this.totalRows = Number(response.message);
          this.accountTypeListAfi.forEach(item => {
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

  inActiveAccountType(accountType_details: AccountTypeListAfi) {
    if (!accountType_details.esta_activo) {
      this.message = '¿Seguro que desea Inactivar el tipo de cuenta?';
      this.visibleDialog = true;
      accountType_details.esta_activo = false;
    } else {
      this.message = '¿Seguro que desea Activar el tipo de cuenta?';
      this.visibleDialog = true;
      accountType_details.esta_activo = true;
    }
    this.accountType_details = accountType_details;
  }
  displayAccountType(accountType_details: AccountTypeListAfi) {
    this.visibleDialogCategory = true;
    this.buttonmsg = '';
    this.message = 'Detalles del tipo de cuenta';
    this.read_only = true;
    this.enableCreate = false;
    this.accountType_details = accountType_details;
  }
  editAccountType(accountType_details: AccountTypeListAfi) {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar el tipo de cuenta';
    this.read_only = false;
    this.enableCreate = false;
    this.accountType_details = accountType_details;
  }
  createAccountType() {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear tipo de cuenta';
    this.read_only = false;
    this.enableCreate = true;
  }

  closeDialogAccountType(value: boolean) {
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
  setParameter(accountType_details: AccountTypeListAfi) {
     if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      if (this.accountTypeListAfi.some(obj => obj.nombre_tipo_cuenta === accountType_details.nombre_tipo_cuenta)) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe un tipo de cuenta con ese nombre ' + accountType_details.nombre_tipo_cuenta;
        this.severity = 'danger';
      } else {
        this.userService.createAccountType(accountType_details).subscribe({
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
      this.userService.modifyAccountType(accountType_details).subscribe({
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
      this.userService.inactivateAccountType(this.accountType_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            if ((this.accountType_details.esta_activo = true)) {
              this.accountType_details.esta_activo = false;
            } else {
              this.accountType_details.esta_activo = true;
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
