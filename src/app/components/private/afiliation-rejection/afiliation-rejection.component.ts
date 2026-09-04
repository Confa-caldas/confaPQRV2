import { Component, OnInit } from '@angular/core';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import { AfiMotivoRechazoParamList, Pagination } from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-afiliation-rejection',
  templateUrl: './afiliation-rejection.component.html',
  styleUrl: './afiliation-rejection.component.scss',
})
export class AfiliationRejectionComponent implements OnInit {
  motivoRechazoList: AfiMotivoRechazoParamList[] = [];
  motivoRechazoDetails!: AfiMotivoRechazoParamList;
  visibleDialog = false;
  visibleDialogInput = false;
  message = '';
  buttonmsg = '';
  parameter = [''];
  inputForm: string[] = [];
  enableCreate = false;
  enableAction = false;
  read_only = false;
  visibleDialogAlert = false;
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

  private normalizeRow(item: AfiMotivoRechazoParamList): void {
    item.esta_activo = item.esta_activo === 1 || item.esta_activo === true;
    if (!item.descripcion_motivo?.trim() && item.motivo_rechazo) {
      item.descripcion_motivo = item.motivo_rechazo;
    }
  }

  private descripcion(row: AfiMotivoRechazoParamList): string {
    return (row.descripcion_motivo ?? row.motivo_rechazo ?? '').trim();
  }

  loadTable(): void {
    const payload: Pagination = {
      page: this.page,
      page_size: this.rows,
    };
    this.userService.getAfiMotivoRechazoListPagination(payload).subscribe({
      next: (response: BodyResponse<AfiMotivoRechazoParamList[]>) => {
        if (response.code === 200) {
          this.motivoRechazoList = response.data;
          this.totalRows = Number(response.message);
          this.motivoRechazoList.forEach(item => this.normalizeRow(item));
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: unknown) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }

  inActiveMotivo(row: AfiMotivoRechazoParamList): void {
    const activo = row.esta_activo === true || row.esta_activo === 1;
    if (!activo) {
      this.message = '¿Seguro que desea inactivar el motivo de rechazo?';
      this.visibleDialog = true;
      row.esta_activo = false;
    } else {
      this.message = '¿Seguro que desea activar el motivo de rechazo?';
      this.visibleDialog = true;
      row.esta_activo = true;
    }
    this.motivoRechazoDetails = row;
  }

  editMotivo(row: AfiMotivoRechazoParamList): void {
    this.motivoRechazoDetails = row;
    this.inputForm = [row.codigo_motivo ?? '', this.descripcion(row), String(row.id ?? '')];
    this.visibleDialogInput = true;
    this.enableCreate = false;
    this.read_only = false;
    this.message = 'Modificar motivo de rechazo';
    this.buttonmsg = 'Modificar';
    this.parameter = [
      'Código motivo',
      'Escriba el código',
      'Descripción del motivo',
      'Escriba la descripción',
    ];
  }

  createMotivo(): void {
    this.visibleDialogInput = true;
    this.enableCreate = true;
    this.read_only = false;
    this.buttonmsg = 'Crear';
    this.parameter = [
      'Código motivo',
      'Escriba el código',
      'Descripción del motivo',
      'Escriba la descripción',
    ];
    this.message = 'Crear motivo de rechazo';
    this.inputForm = [];
  }

  closeDialog(value: boolean): void {
    this.visibleDialog = false;
    if (value) {
      const payload: AfiMotivoRechazoParamList = {
        ...this.motivoRechazoDetails,
        descripcion_motivo: this.descripcion(this.motivoRechazoDetails),
      };
      this.userService.inactivateAfiMotivoRechazo(payload).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            this.motivoRechazoDetails.esta_activo = !this.motivoRechazoDetails.esta_activo;
          }
        },
        error: (err: unknown) => {
          console.log(err);
        },
        complete: () => {
          this.ngOnInit();
        },
      });
    } else {
      this.ngOnInit();
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
    const codigo = (inputValue[0] ?? '').trim();
    const descripcion = (inputValue[1] ?? '').trim();
    const idStr = inputValue[2];

    if (this.enableCreate) {
      const duplicado = this.motivoRechazoList?.some(
        r => (r.codigo_motivo ?? '').trim().toLowerCase() === codigo.toLowerCase()
      );
      if (duplicado) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe un motivo con el código: ' + codigo;
        this.severity = 'danger';
        return;
      }
      this.userService
        .createAfiMotivoRechazo({
          codigo_motivo: codigo,
          descripcion_motivo: descripcion,
          esta_activo: true,
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
            this.ngOnInit();
          },
        });
    } else {
      const id = Number(idStr);
      if (!Number.isFinite(id) || id <= 0) {
        this.showSuccessMessage('error', 'Fallida', 'No se identificó el motivo a modificar.');
        return;
      }
      const duplicado = this.motivoRechazoList?.some(
        r =>
          r.id !== id &&
          (r.codigo_motivo ?? '').trim().toLowerCase() === codigo.toLowerCase()
      );
      if (duplicado) {
        this.visibleDialogAlert = true;
        this.informative = true;
        this.message = 'Ya existe otro motivo con el código: ' + codigo;
        this.severity = 'danger';
        return;
      }
      this.userService
        .modifyAfiMotivoRechazo({
          id,
          codigo_motivo: codigo,
          descripcion_motivo: descripcion,
          esta_activo: this.motivoRechazoDetails?.esta_activo ?? true,
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
            this.ngOnInit();
          },
        });
    }
  }
}
