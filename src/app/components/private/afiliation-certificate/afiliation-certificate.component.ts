import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { AfiCertificateList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-afiliation-certificate',
  templateUrl: './afiliation-certificate.component.html',
  styleUrl: './afiliation-certificate.component.scss'
})
export class AfiliationCertificateComponent {
data!: IRequestManager[];
  afiCertificateList!: AfiCertificateList[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogCategory = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  afiCertificateList_details!: AfiCertificateList;
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
    this.getAfiCertificateTablePagination();
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getAfiCertificateTablePagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getAfiCertificateTablePagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getAfiCertificateTablePagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }
  getAfiCertificateTablePagination() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getAfiCertificateListPagination(payload).subscribe({
      next: (response: BodyResponse<AfiCertificateList[]>) => {
        if (response.code === 200) {
          this.afiCertificateList = response.data;
          this.totalRows = Number(response.message);
          this.afiCertificateList.forEach(item => {
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

  inActiveGender(afiCertificateList_details: AfiCertificateList) {
    if (!afiCertificateList_details.esta_activo) {
      this.message = '¿Seguro que desea Inactivar el registro?';
      this.visibleDialog = true;
      afiCertificateList_details.esta_activo = false;
    } else {
      this.message = '¿Seguro que desea Activar el registro?';
      this.visibleDialog = true;
      afiCertificateList_details.esta_activo = true;
    }
    this.afiCertificateList_details = afiCertificateList_details;
  }
  displayGender(afiCertificateList_details: AfiCertificateList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = '';
    this.message = 'Detalles del registro';
    this.read_only = true;
    this.enableCreate = false;
    this.afiCertificateList_details = afiCertificateList_details;
  }
  editGender(afiCertificateList_details: AfiCertificateList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar el registro';
    this.read_only = false;
    this.enableCreate = false;
    this.afiCertificateList_details = afiCertificateList_details;
  }
  createGender() {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear registro';
    this.read_only = false;
    this.enableCreate = true;
  }

  closeDialogGender(value: boolean) {
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
  setParameter(afiCertificateList_details: AfiCertificateList) {

    console.log(afiCertificateList_details);

    if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
        
      /*if (this.afiCertificateList.some(obj => obj.tipo_certificado === afiCertificateList_details.tipo_certificado)) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe un genero con ese nombre ' + afiCertificateList_details.tipo_certificado;
        this.severity = 'danger'; 
      } else {*/

        this.userService.createAfiCertificate(afiCertificateList_details).subscribe({
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
      /*}*/

    } else {
      this.userService.modifyAfiCertificate(afiCertificateList_details).subscribe({
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
      this.userService.inactivateAfiCertificate(this.afiCertificateList_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            if ((this.afiCertificateList_details.esta_activo = true)) {
              this.afiCertificateList_details.esta_activo = false;
            } else {
              this.afiCertificateList_details.esta_activo = true;
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
