import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { DocumentTypePersonList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-afiliation-document-type-person',
  templateUrl: './afiliation-document-type-person.component.html',
  styleUrl: './afiliation-document-type-person.component.scss'
})
export class AfiliationDocumentTypePersonComponent {
  data!: IRequestManager[];
  documentTypePersonList!: DocumentTypePersonList[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogDocumentTypePerson = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  documentTypePersona_details!: DocumentTypePersonList;
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
    this.getDocumentTypePersonTablePagination();
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getDocumentTypePersonTablePagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getDocumentTypePersonTablePagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getDocumentTypePersonTablePagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }
  getDocumentTypePersonTablePagination() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getDocumentoTypePersonListPagination(payload).subscribe({
      next: (response: BodyResponse<DocumentTypePersonList[]>) => {
        if (response.code === 200) {
          this.documentTypePersonList = response.data;
          this.totalRows = Number(response.message);
          this.documentTypePersonList.forEach(item => {
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

  inActiveDocumentTypePerson(documentTypePersona_details: DocumentTypePersonList) {
    if (!documentTypePersona_details.esta_activo) {
      this.message = '¿Seguro que desea Inactivar el tipo de documento?';
      this.visibleDialog = true;
      documentTypePersona_details.esta_activo = false;
    } else {
      this.message = '¿Seguro que desea Activar el tipo de documento?';
      this.visibleDialog = true;
      documentTypePersona_details.esta_activo = true;
    }
    this.documentTypePersona_details = documentTypePersona_details;
  }
  displayDocumentTypePerson(documentTypePersona_details: DocumentTypePersonList) {
    this.visibleDialogDocumentTypePerson = true;
    this.buttonmsg = '';
    this.message = 'Detalles tipo de documento trabajador/beneficiario';
    this.read_only = true;
    this.enableCreate = false;
    this.documentTypePersona_details = documentTypePersona_details;
  }
  editDocumentTypePerson(documentTypePersona_details: DocumentTypePersonList) {
    this.visibleDialogDocumentTypePerson = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar tipo de documento trabajador/beneficiario';
    this.read_only = false;
    this.enableCreate = false;
    this.documentTypePersona_details = documentTypePersona_details;
  }
  createDocumentTypePerson() {
    this.visibleDialogDocumentTypePerson = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear tipo de documento trabajador/beneficiario';
    this.read_only = false;
    this.enableCreate = true;
  }

  closeDialogDocumentTypePerson(value: boolean) {
    this.visibleDialogDocumentTypePerson = false;
    this.enableAction = value;
    if (value) {
      //
    }
  }

  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAction = value;
  }
  setParameter(documentTypePersona_details: DocumentTypePersonList) {
     if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      
      if (this.documentTypePersonList.some(obj => obj.tipo_documento === documentTypePersona_details.tipo_documento)) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe un tipo de documento con ese nombre ' + documentTypePersona_details.tipo_documento;
        this.severity = 'danger';
      } else {
        this.userService.createDocumentoTypePerson(documentTypePersona_details).subscribe({
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
      this.userService.modifyDocumentoTypePerson(documentTypePersona_details).subscribe({
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
      this.userService.inactivateDocumentoTypePerson(this.documentTypePersona_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            if ((this.documentTypePersona_details.esta_activo = true)) {
              this.documentTypePersona_details.esta_activo = false;
            } else {
              this.documentTypePersona_details.esta_activo = true;
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
