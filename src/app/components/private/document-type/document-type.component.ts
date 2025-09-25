import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { ApplicantTypeList, DocumentTypeList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-document-type',
  templateUrl: './document-type.component.html',
  styleUrl: './document-type.component.scss',
})
export class DocumentTypeComponent implements OnInit {
  data!: IRequestManager[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogInput = false;
  message = '';
  buttonmsg = '';
  parameter = [''];
  inputForm: any[] = [];
  enableCreate: boolean = false;
  enableAction: boolean = false;
  documentTypeList!: DocumentTypeList[];
  document_type_details!: DocumentTypeList;

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
    this.getDocumentTypesListPagination();
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getDocumentTypesListPagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getDocumentTypesListPagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getDocumentTypesListPagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }

  getDocumentTypesListPagination() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getDocumentTypesListPagination(payload).subscribe({
      next: (response: BodyResponse<DocumentTypeList[]>) => {
        if (response.code === 200) {
          this.documentTypeList = response.data;
          this.totalRows = Number(response.message);
          this.documentTypeList.forEach(item => {
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

  inActiveDocument(document_type_details: DocumentTypeList) {
    if (!document_type_details.is_active) {
      this.message = '¿Seguro que desea Inactivar este documento?';
      this.visibleDialog = true;
      document_type_details.is_active = 0;
    } else {
      this.message = '¿Seguro que desea Activar este documento?';
      this.visibleDialog = true;
      document_type_details.is_active = 1;
    }
    this.document_type_details = document_type_details;
  }

  editDocument(document_details: DocumentTypeList) {
    this.inputForm = [
      document_details['document_type_code'],
      document_details['document_type_name'],
      document_details['document_type_description'],
      document_details['document_type_id'],
    ];
    this.visibleDialogInput = true;
    this.enableCreate = false;
    this.message = 'Modificar documento';
    this.buttonmsg = 'Modificar';
    this.parameter = [
      'Código documento',
      'Código del documento',
      'Nombre documento',
      'Nombre del documento',
      'Descripción del documento',
      'Escriba descripción',
    ];
  }
  createDocumentType() {
    this.visibleDialogInput = true;
    this.enableCreate = true;
    this.buttonmsg = 'Crear';
    this.parameter = [
      'Código documento',
      'Código del documento',
      'Nombre documento',
      'Nombre del documento',
      'Descripción del documento',
      'Escriba descripción',
    ];
    this.message = 'Crear documento';
  }

  closeDialog(value: boolean) {
    this.visibleDialog = false;
    if (value) {
      this.userService.inactivateDocument(this.document_type_details).subscribe({
        next: (response: BodyResponse<DocumentTypeList[]>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            if ((this.document_type_details.is_active = 1)) {
              this.document_type_details.is_active = 0;
            } else {
              this.document_type_details.is_active = 1;
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
  closeDialogInput(value: boolean) {
    this.visibleDialogInput = false;
    this.enableAction = value;
  }
  setParameter(inputValue: string[]) {
    if (!this.enableAction) {
      return;
    } else if (this.enableCreate) {
      const payload = {
        document_type_code: inputValue[0],
        document_type_name: inputValue[1],
        document_type_description: inputValue[2],
      };
      this.userService.createDocumentType(payload).subscribe({
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
    } else {
      const payload = {
        document_type_code: inputValue[0],
        document_type_name: inputValue[1],
        document_type_description: inputValue[2],
        document_type_id: Number(inputValue[3]),
      };
      this.userService.modifyDocumentType(payload).subscribe({
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

