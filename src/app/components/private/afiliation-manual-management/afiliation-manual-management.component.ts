import { Component, OnInit } from '@angular/core';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { AfiMotivoGestionManualList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-afiliation-manual-management',
  templateUrl: './afiliation-manual-management.component.html',
  styleUrl: './afiliation-manual-management.component.scss',
})
export class AfiliationManualManagementComponent implements OnInit {
  motivoGestionManualList: AfiMotivoGestionManualList[] = [];
  motivoGestionManualDetails!: AfiMotivoGestionManualList;
  visibleDialog = false;
  visibleDialogInput = false;
  visibleDialogAlert = false;
  message = '';
  parameter = [''];
  buttonmsg = '';
  inputForm: string[] = [];
  oneField = true;
  enableCreate = false;
  enableAction = false;
  read_only = false;
  informative = false;
  severity = '';

  first = 0;
  page = 1;
  rows = 10;
  totalRows = 0;

  constructor(
    private userService: Users,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadTable();
  }

  onPageChange(event: PaginatorState): void {
    this.first = event.first || 0;
    this.rows = event.rows || 0;
    this.page = Number(event.page) + 1 || 0;
    this.loadTable();
  }

  showSuccessMessage(state: string, title: string, msg: string): void {
    this.messageService.add({ severity: state, summary: title, detail: msg });
  }

  loadTable(): void {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getAfiMotivoGestionManualListPagination(payload).subscribe({
      next: (response: BodyResponse<AfiMotivoGestionManualList[]>) => {
        if (response.code === 200) {
          this.motivoGestionManualList = response.data;
          this.totalRows = Number(response.message);
          this.motivoGestionManualList.forEach(item => {
            item.estado = item.estado === 1 || item.estado === true;
          });
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: unknown) => {
        console.log(err);
      },
    });
  }

  inActiveMotivo(row: AfiMotivoGestionManualList): void {
    if (!row.estado) {
      this.message = '¿Seguro que desea inactivar el motivo de gestión manual?';
      this.visibleDialog = true;
      row.estado = false;
    } else {
      this.message = '¿Seguro que desea activar el motivo de gestión manual?';
      this.visibleDialog = true;
      row.estado = true;
    }
    this.motivoGestionManualDetails = row;
  }

  editMotivo(row: AfiMotivoGestionManualList): void {
    this.inputForm = [row.motivo_gestion, '', String(row.id ?? '')];
    this.visibleDialogInput = true;
    this.oneField = true;
    this.enableCreate = false;
    this.read_only = false;
    this.message = 'Modificar motivo de gestión manual';
    this.buttonmsg = 'Actualizar';
    this.parameter = ['Motivo gestión', 'Escriba el motivo de gestión'];
    this.motivoGestionManualDetails = row;
  }

  createMotivo(): void {
    this.inputForm = [];
    this.visibleDialogInput = true;
    this.oneField = true;
    this.enableCreate = true;
    this.read_only = false;
    this.buttonmsg = 'Guardar';
    this.parameter = ['Motivo gestión', 'Escriba el motivo de gestión'];
    this.message = 'Crear motivo de gestión manual';
  }

  closeDialog(value: boolean): void {
    this.visibleDialog = false;
    if (value) {
      this.userService.inactivateAfiMotivoGestionManual(this.motivoGestionManualDetails).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            this.motivoGestionManualDetails.estado = !this.motivoGestionManualDetails.estado;
          }
        },
        error: (err: unknown) => {
          console.log(err);
        },
        complete: () => {
          this.loadTable();
        },
      });
    } else {
      this.loadTable();
    }
  }

  closeDialogInput(value: boolean): void {
    this.visibleDialogInput = false;
    this.enableAction = value;
  }

  closeDialogAlert(value: boolean): void {
    this.visibleDialogAlert = false;
    this.enableAction = value;
  }

  setParameter(inputValue: string[]): void {
    if (!this.enableAction || this.read_only) {
      return;
    }

    const motivoGestion = (inputValue[0] ?? '').trim();
    if (!motivoGestion) {
      this.visibleDialogAlert = true;
      this.informative = true;
      this.message = 'El campo Motivo gestión es requerido';
      this.severity = 'danger';
      return;
    }

    if (this.enableCreate) {
      const duplicado = this.motivoGestionManualList?.some(
        r => (r.motivo_gestion ?? '').trim().toLowerCase() === motivoGestion.toLowerCase()
      );
      if (duplicado) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe un motivo con la descripción: ' + motivoGestion;
        this.severity = 'danger';
        return;
      }
      this.userService
        .createAfiMotivoGestionManual({ motivo_gestion: motivoGestion })
        .subscribe({
          next: (response: BodyResponse<string>) => {
            if (response.code === 200) {
              this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
            } else {
              this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            }
          },
          error: (err: unknown) => {
            console.log(err);
          },
          complete: () => {
            this.loadTable();
          },
        });
    } else {
      const id = Number(inputValue[2]);
      const duplicado = this.motivoGestionManualList?.some(
        r =>
          r.id !== id &&
          (r.motivo_gestion ?? '').trim().toLowerCase() === motivoGestion.toLowerCase()
      );
      if (duplicado) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe otro motivo con la descripción: ' + motivoGestion;
        this.severity = 'danger';
        return;
      }
      this.userService
        .modifyAfiMotivoGestionManual({
          id,
          motivo_gestion: motivoGestion,
          estado: this.motivoGestionManualDetails.estado,
        })
        .subscribe({
          next: (response: BodyResponse<string>) => {
            if (response.code === 200) {
              this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
            } else {
              this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            }
          },
          error: (err: unknown) => {
            console.log(err);
          },
          complete: () => {
            this.loadTable();
          },
        });
    }
  }
}
