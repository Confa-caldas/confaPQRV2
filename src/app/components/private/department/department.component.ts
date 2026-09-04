import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { DepartmentList, GenderList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrl: './department.component.scss'
})
export class DepartmentComponent {
data!: IRequestManager[];
  genderList!: GenderList[];
  departmentList!: DepartmentList[];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogCategory = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  gender_details!: GenderList;
  department_details!: DepartmentList;
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
    this.getDepartmentTablePagination();
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.getDepartmentTablePagination();
  }
  cleanForm() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getDepartmentTablePagination();
  }

  initPaginador() {
    this.first = 0;
    this.page = 1;
    this.rows = 10;
    this.getDepartmentTablePagination();
  }
  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }
  getDepartmentTablePagination() {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getDepartmentListPagination(payload).subscribe({
      next: (response: BodyResponse<DepartmentList[]>) => {
        if (response.code === 200) {
          this.departmentList = response.data;
          this.totalRows = Number(response.message);
          this.departmentList.forEach(item => {
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

  inActiveDepartment(department_details: DepartmentList) {
    if (!department_details.esta_activo) {
      this.message = '¿Seguro que desea Inactivar el departamento?';
      this.visibleDialog = true;
      department_details.esta_activo = false;
    } else {
      this.message = '¿Seguro que desea Activar el departamento?';
      this.visibleDialog = true;
      department_details.esta_activo = true;
    }
    this.department_details = department_details;
  }
  displayDepartment(department_details: DepartmentList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = '';
    this.message = 'Detalles del departamento';
    this.read_only = true;
    this.enableCreate = false;
    this.department_details = department_details;
  }
  editDepartment(department_details: DepartmentList) {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar el departamento';
    this.read_only = false;
    this.enableCreate = false;
    this.department_details = department_details;
  }
  createDepartment() {
    this.visibleDialogCategory = true;
    this.buttonmsg = 'Crear';
    this.message = 'Crear departamento';
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
  setParameter(department_details: DepartmentList) {

    console.log(department_details)

     if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      if (this.departmentList.some(obj => obj.nombre_departamento === department_details.nombre_departamento)) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe un departamento con ese nombre ' + department_details.nombre_departamento;
        this.severity = 'danger';
      } else {
        this.userService.createDepartment(department_details).subscribe({
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
      this.userService.modifyDepartment(department_details).subscribe({
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
      this.userService.inactivateDepartment(this.department_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            if ((this.department_details.esta_activo = true)) {
              this.department_details.esta_activo = false;
            } else {
              this.department_details.esta_activo = true;
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
