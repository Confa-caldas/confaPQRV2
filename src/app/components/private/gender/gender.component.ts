import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { GenderList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-gender',
  templateUrl: './gender.component.html',
  styleUrl: './gender.component.scss'
})
export class GenderComponent {
  data!: IRequestManager[];
  genderList!: GenderList[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogCategory = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  gender_details!: GenderList;
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
    this.getGenderTablePagination();
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getGenderTablePagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getGenderTablePagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getGenderTablePagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }
  getGenderTablePagination() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getGenderListPagination(payload).subscribe({
      next: (response: BodyResponse<GenderList[]>) => {
        if (response.code === 200) {
          this.genderList = response.data;
          this.totalRows = Number(response.message);
          this.genderList.forEach(item => {
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

  inActiveGender(gender_details: GenderList) {

    console.log(gender_details.esta_activo+"sdsd");

    if (!gender_details.esta_activo) {
      this.message = '¿Seguro que desea Inactivar el género?';
      this.visibleDialog = true;
      gender_details.esta_activo = false;
    } else {
      this.message = '¿Seguro que desea Activar el género?';
      this.visibleDialog = true;
      gender_details.esta_activo = true;
    }
    this.gender_details = gender_details;
  }
  displayGender(gender_details: GenderList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = '';
    this.message = 'Detalles del género';
    this.read_only = true;
    this.enableCreate = false;
    this.gender_details = gender_details;
  }
  editGender(gender_details: GenderList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar el género';
    this.read_only = false;
    this.enableCreate = false;
    this.gender_details = gender_details;
  }
  createGender() {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear género';
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
  setParameter(gender_details: GenderList) {
     if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      if (this.genderList.some(obj => obj.genero === gender_details.genero)) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe un genero con ese nombre ' + gender_details.genero;
        this.severity = 'danger';
      } else {
        this.userService.createGender(gender_details).subscribe({
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
      this.userService.modifyGender(gender_details).subscribe({
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
      this.userService.inactivateGender(this.gender_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            if ((this.gender_details.esta_activo = true)) {
              this.gender_details.esta_activo = false;
            } else {
              this.gender_details.esta_activo = true;
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
