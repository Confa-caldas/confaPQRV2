import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { AttachmentTypeList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-attachment-type',
  templateUrl: './attachment-type.component.html',
  styleUrl: './attachment-type.component.scss'
})
export class AttachmentTypeComponent {
  data!: IRequestManager[];
  attachmentTypeList!: AttachmentTypeList[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogCategory = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  attachmentType_details!: AttachmentTypeList;
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
    this.getAttachmentTypeTablePagination();
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getAttachmentTypeTablePagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getAttachmentTypeTablePagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getAttachmentTypeTablePagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }
  getAttachmentTypeTablePagination() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getAttachmentTypeListPagination(payload).subscribe({
      next: (response: BodyResponse<AttachmentTypeList[]>) => {
        if (response.code === 200) {
          this.attachmentTypeList = response.data;
          this.totalRows = Number(response.message);
          this.attachmentTypeList.forEach(item => {
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

  inActiveDocumentTypeCompany(attachmentType_details: AttachmentTypeList) {
    if (!attachmentType_details.esta_activo) {
      this.message = '¿Seguro que desea Inactivar el tipo de adjunto?';
      this.visibleDialog = true;
      attachmentType_details.esta_activo = false;
    } else {
      this.message = '¿Seguro que desea Activar el tipo de adjunto?';
      this.visibleDialog = true;
      attachmentType_details.esta_activo = true;
    }
    this.attachmentType_details = attachmentType_details;
  }
  displayAfiTemplateValidation(attachmentType_details: AttachmentTypeList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = '';
    this.message = 'Detalles tipo de adjunto';
    this.read_only = true;
    this.enableCreate = false;
    this.attachmentType_details = attachmentType_details;
  }
  editAfiTemplateValidation(attachmentType_details: AttachmentTypeList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar tipo de adjunto';
    this.read_only = false;
    this.enableCreate = false;
    this.attachmentType_details = attachmentType_details;
  }
  createDocumentTypeCompany() {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear tipo de adjunto';
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
  setParameter(attachmentType_details: AttachmentTypeList) {
     if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      
      if (this.attachmentTypeList.some(obj => obj.nombre_documento === attachmentType_details.nombre_documento)) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe un tipo de adjunto con ese nombre ' + attachmentType_details.nombre_documento;
        this.severity = 'danger';
      } else {
        this.userService.createAttachmentType(attachmentType_details).subscribe({
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
      this.userService.modifyAttachmentType(attachmentType_details).subscribe({
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
      this.userService.inactivateAttachmentType(this.attachmentType_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            if ((this.attachmentType_details.esta_activo = true)) {
              this.attachmentType_details.esta_activo = false;
            } else {
              this.attachmentType_details.esta_activo = true;
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
