import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { DocumentTypeCompanyList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-afiliation-document-type',
  templateUrl: './afiliation-document-type.component.html',
  styleUrl: './afiliation-document-type.component.scss'
})
export class AfiliationDocumentTypeComponent {
  data!: IRequestManager[];
  documentTypeCompanyList!: DocumentTypeCompanyList[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogCategory = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  documentTypeCompany_details!: DocumentTypeCompanyList;
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
    this.getDocumentTypeCompanyTablePagination();
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getDocumentTypeCompanyTablePagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getDocumentTypeCompanyTablePagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getDocumentTypeCompanyTablePagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }
  getDocumentTypeCompanyTablePagination() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getDocumentoTypeCompanyListPagination(payload).subscribe({
      next: (response: BodyResponse<DocumentTypeCompanyList[]>) => {
        if (response.code === 200) {
          this.documentTypeCompanyList = response.data;
          this.totalRows = Number(response.message);
          this.documentTypeCompanyList.forEach(item => {
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

  inActiveDocumentTypeCompany(documentTypeCompany_details: DocumentTypeCompanyList) {
    if (!documentTypeCompany_details.esta_activo) {
      this.message = '¿Seguro que desea Inactivar el tipo de documento empresa?';
      this.visibleDialog = true;
      documentTypeCompany_details.esta_activo = false;
    } else {
      this.message = '¿Seguro que desea Activar el tipo de documento empresa?';
      this.visibleDialog = true;
      documentTypeCompany_details.esta_activo = true;
    }
    this.documentTypeCompany_details = documentTypeCompany_details;
  }
  displayAfiTemplateValidation(documentTypeCompany_details: DocumentTypeCompanyList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = '';
    this.message = 'Detalles tipo de documento empresa';
    this.read_only = true;
    this.enableCreate = false;
    this.documentTypeCompany_details = documentTypeCompany_details;
  }
  editAfiTemplateValidation(documentTypeCompany_details: DocumentTypeCompanyList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar tipo de documento empresa';
    this.read_only = false;
    this.enableCreate = false;
    this.documentTypeCompany_details = documentTypeCompany_details;
  }
  createDocumentTypeCompany() {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear tipo de documento empresa';
    this.read_only = false;
    this.enableCreate = true;
  }

  closeDialogDocumentTypeCompany(value: boolean) {
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
  setParameter(documentTypeCompany_details: DocumentTypeCompanyList) {
     if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      
      if (this.documentTypeCompanyList.some(obj => obj.tipo_documento === documentTypeCompany_details.tipo_documento)) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe un tipo de documento con ese nombre ' + documentTypeCompany_details.tipo_documento;
        this.severity = 'danger';
      } else {
        this.userService.createDocumentoTypeCompany(documentTypeCompany_details).subscribe({
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
      this.userService.modifyDocumentoTypeCompany(documentTypeCompany_details).subscribe({
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
      this.userService.inactivateDocumentoTypeCompany(this.documentTypeCompany_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            if ((this.documentTypeCompany_details.esta_activo = true)) {
              this.documentTypeCompany_details.esta_activo = false;
            } else {
              this.documentTypeCompany_details.esta_activo = true;
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
