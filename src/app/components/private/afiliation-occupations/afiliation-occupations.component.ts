import { Component, OnInit } from '@angular/core';
import { IRequestManager } from '../../../models/request-manager/request-manager.interface';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { AfiOccupationList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-afiliation-notifications',
  templateUrl: './afiliation-occupations.component.html',
  styleUrl: './afiliation-occupations.component.scss'
})
export class AfiliationOccupationsComponent {
  data!: IRequestManager[];
  afiOccupationsList!: AfiOccupationList[];
  afiOccupations_details!: AfiOccupationList;
  ingredient!: string;
  visibleDialog = false;
  visibleDialogCategory = false;
  visibleDialogInput = false;
  oneField = false;
  inputForm: any[] = [];
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
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
    this.userService.getAfiOccupationListPagination(payload).subscribe({
      next: (response: BodyResponse<AfiOccupationList[]>) => {
        if (response.code === 200) {
          this.afiOccupationsList= response.data;
          this.totalRows = Number(response.message);
          this.afiOccupationsList.forEach(item => {
            item.estado = item.estado === 1 || item.estado === true;
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

  inActiveAfiOccupations(afiOccupations_details: AfiOccupationList) {
    if (!afiOccupations_details.estado) {
      this.message = '¿Seguro que desea Inactivar la ocupación?';
      this.visibleDialog = true;
      afiOccupations_details.estado = false;
    } else {
      this.message = '¿Seguro que desea Activar la ocupación?';
      this.visibleDialog = true;
      afiOccupations_details.estado = true;
    }
    this.afiOccupations_details = afiOccupations_details;
  }
  displayAfiOccupations(afiOccupations_details: AfiOccupationList) {
    this.visibleDialogInput = true;
    this.buttonmsg = '';
    this.message = 'Detalles de la ocupación';
    this.read_only = true;
    this.enableCreate = false;
    this.afiOccupations_details = afiOccupations_details;
  }
  editAfiOccupations(afiOccupations_details: AfiOccupationList) {
    this.inputForm = [
      afiOccupations_details.cargo,
      '',
      String(afiOccupations_details.id ?? ''),
    ];
    this.visibleDialogInput = true;
    this.oneField = true;
    this.buttonmsg = 'Modificar';
    this.message = 'Modificar la ocupación';
    this.read_only = false;
    this.enableCreate = false;
    this.afiOccupations_details = afiOccupations_details;
  }
  createAfiNotifications() {
    this.inputForm = [];
    this.visibleDialogInput = true;
    this.buttonmsg = 'Crear';
    this.oneField = true;
    this.enableCreate = true;
    this.read_only = false;
    this.parameter = [
      'Ocupación',
      'Escriba ocupación',
    ];
    this.message = 'Crear ocupación';
    this.informative = false;
  }

  closeDialogAfiNotifications(value: boolean) {
    this.visibleDialogCategory = false;
    this.enableAction = value;
    if (value) {
      //
    }
  }

  closeDialogInput(value: boolean) {
    this.visibleDialogInput = false;
    this.enableAction = value;
  }

  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAction = value;
  }
  setParameter(inputValue: string[]) {
     if (!this.enableAction || this.read_only) {
      return;
    } else if (this.enableCreate) {
      if (this.afiOccupationsList.some(obj => obj.cargo === inputValue[0])) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe una ocupación con ese nombre ' + inputValue[0];
        this.severity = 'danger';
      } else {
        this.userService.createAfiOccupation({
          cargo: inputValue[0],
        } as AfiOccupationList).subscribe({
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
      this.userService.modifyAfiOccupation({
        id: Number(inputValue[2]),
        cargo: inputValue[0],
        estado: this.afiOccupations_details.estado,
      } as AfiOccupationList).subscribe({
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
      this.userService.inactivateAfiOccupation(this.afiOccupations_details).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            this.afiOccupations_details.estado = !this.afiOccupations_details.estado;
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
