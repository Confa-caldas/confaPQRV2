import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { AfiTemplateValidationList, GenderList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-afiliation-template-validations',
  templateUrl: './afiliation-template-validations.component.html',
  styleUrl: './afiliation-template-validations.component.scss'
})
export class AfiliationTemplateValidationsComponent {
data!: IRequestManager[];
  genderList!: GenderList[];
  afiTemplateValidationList!: AfiTemplateValidationList[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogCategory = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  gender_details!: GenderList;
  afiTemplateValidation_details!: AfiTemplateValidationList;
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
    this.getAfiliationTemplateValidationsTablePagination();
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getAfiliationTemplateValidationsTablePagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getAfiliationTemplateValidationsTablePagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getAfiliationTemplateValidationsTablePagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }
  getAfiliationTemplateValidationsTablePagination() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getAfiliationTemplateValidationsListPagination(payload).subscribe({
      next: (response: BodyResponse<AfiTemplateValidationList[]>) => {
        if (response.code === 200) {
          this.afiTemplateValidationList = response.data;
          this.totalRows = Number(response.message);
          this.afiTemplateValidationList.forEach(item => {
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

  inActiveGender(afiTemplateValidation_details: AfiTemplateValidationList) {
    if (!afiTemplateValidation_details.esta_activo) {
      this.message = '¿Seguro que desea Inactivar el campo?';
      this.visibleDialog = true;
      afiTemplateValidation_details.esta_activo = false;
    } else {
      this.message = '¿Seguro que desea Activar el campo?';
      this.visibleDialog = true;
      afiTemplateValidation_details.esta_activo = true;
    }
    this.afiTemplateValidation_details = afiTemplateValidation_details;
  }
  displayAfiTemplateValidation(afiTemplateValidation_details: AfiTemplateValidationList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = '';
    this.message = 'Detalles del campo validación de plantilla afiliación masiva';
    this.read_only = true;
    this.enableCreate = false;
    this.afiTemplateValidation_details = afiTemplateValidation_details;
  }
  editAfiTemplateValidation(afiTemplateValidation_details: AfiTemplateValidationList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar el campo validación de plantilla afiliación masiva';
    this.read_only = false;
    this.enableCreate = false;
    this.afiTemplateValidation_details = afiTemplateValidation_details;
  }
  createAfiTemplateValidation() {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear campo validación de plantilla afiliación masiva';
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
  setParameter(afiTemplateValidation_details: AfiTemplateValidationList) {
     if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      if (this.afiTemplateValidationList.some(obj => obj.nombre_campo === afiTemplateValidation_details.nombre_campo)) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe un campo con ese nombre ' + afiTemplateValidation_details.nombre_campo;
        this.severity = 'danger';
      } else {
        this.userService.createAfiTemplateValidation(afiTemplateValidation_details).subscribe({
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
      this.userService.modifyAfiTemplateValidation(afiTemplateValidation_details).subscribe({
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
      this.userService.inactivateAfiTemplateValidation(this.afiTemplateValidation_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            if ((this.afiTemplateValidation_details.esta_activo = true)) {
              this.afiTemplateValidation_details.esta_activo = false;
            } else {
              this.afiTemplateValidation_details.esta_activo = true;
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
