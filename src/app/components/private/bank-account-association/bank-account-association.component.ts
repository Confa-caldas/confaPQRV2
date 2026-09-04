import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { AssociateBankAccountList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-bank-account-association',
  templateUrl: './bank-account-association.component.html',
  styleUrl: './bank-account-association.component.scss'
})
export class BankAccountAssociationComponent {
  data!: IRequestManager[];
  associateBankAccountList!: AssociateBankAccountList[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogAssociate = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  associateBankAccount_details!: AssociateBankAccountList;
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
    this.getAssociateBankAccountTablePagination();
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getAssociateBankAccountTablePagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getAssociateBankAccountTablePagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getAssociateBankAccountTablePagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }
  getAssociateBankAccountTablePagination() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getAssociateBankAccountListPagination(payload).subscribe({
      next: (response: BodyResponse<AssociateBankAccountList[]>) => {
        if (response.code === 200) {
          this.associateBankAccountList = response.data;
          this.totalRows = Number(response.message);
          this.associateBankAccountList.forEach(item => {
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

  inActiveAssociationBankAccount(associateBankAccount_details: AssociateBankAccountList) {
    if (!associateBankAccount_details.esta_activo) {
      this.message = '¿Seguro que desea Inactivar el registro?';
      this.visibleDialog = true;
      associateBankAccount_details.esta_activo = false;
    } else {
      this.message = '¿Seguro que desea Activar el registro?';
      this.visibleDialog = true;
      associateBankAccount_details.esta_activo = true;
    }
    this.associateBankAccount_details = associateBankAccount_details;
  }
  displayAssociationBankAccount(associateBankAccount_details: AssociateBankAccountList) {
    this.visibleDialogAssociate = true;
    this.buttonmsg = '';
    this.message = 'Detalles del registro';
    this.read_only = true;
    this.enableCreate = false;
    this.associateBankAccount_details = associateBankAccount_details;
  }
  editAssociationBankAccount(associateBankAccount_details: AssociateBankAccountList) {
    this.visibleDialogAssociate = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar el registro';
    this.read_only = false;
    this.enableCreate = false;
    this.associateBankAccount_details = associateBankAccount_details;
  }
  createAssociationBankAccount() {
    this.visibleDialogAssociate = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear registro';
    this.read_only = false;
    this.enableCreate = true;
  }

  closeDialogAssociationBankAccount(value: boolean) {
    this.visibleDialogAssociate = false;
    this.enableAction = value;
    if (value) {
      //
    }
  }
  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAction = value;
  }
  setParameter(associateBankAccount_details: AssociateBankAccountList) {
  
    console.log(associateBankAccount_details);

    if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      const existe = this.associateBankAccountList.some(obj =>
        obj.id_entidad === associateBankAccount_details.id_entidad &&
        obj.id_tipo_cuenta === associateBankAccount_details.id_tipo_cuenta);

      if (existe) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe un registro con ese banco y tipo de cuenta';
        this.severity = 'danger';
      } else {
        this.userService.createAssociateBankAccount(associateBankAccount_details).subscribe({
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
      this.userService.modifyAssociateBankAccount(associateBankAccount_details).subscribe({
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
      this.userService.inactivateAssociateBankAccount(this.associateBankAccount_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            if ((this.associateBankAccount_details.esta_activo = true)) {
              this.associateBankAccount_details.esta_activo = false;
            } else {
              this.associateBankAccount_details.esta_activo = true;
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
