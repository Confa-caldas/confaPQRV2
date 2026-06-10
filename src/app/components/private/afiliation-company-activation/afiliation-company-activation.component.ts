import { Component, OnInit } from '@angular/core';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  ActivacionEmpresaConsultaFila,
  ActivacionEmpresaEstadoGestion,
  ActivacionEmpresaGestionPayload,
  ActivacionEmpresaGestionResultado,
  ConsultarActivacionEmpresaPayload,
} from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-afiliation-company-activation',
  templateUrl: './afiliation-company-activation.component.html',
  styleUrl: './afiliation-company-activation.component.scss',
})
export class AfiliationCompanyActivationComponent implements OnInit {
  registros: ActivacionEmpresaConsultaFila[] = [];

  readonly estadoGestionOpciones = [
    { label: 'Por gestionar', value: 'POR_GESTIONAR' as ActivacionEmpresaEstadoGestion },
    { label: 'Gestionado', value: 'GESTIONADO' as ActivacionEmpresaEstadoGestion },
  ];

  estadoGestion: ActivacionEmpresaEstadoGestion = 'POR_GESTIONAR';
  tipoDocumentoEmpresa = '';
  numeroDocumentoEmpresa = '';

  visibleDialogGestionar = false;
  visibleDialogConfirmacion = false;
  visibleDialogAlert = false;
  message = '';
  informative = false;
  severity = '';

  empresaSeleccionada!: ActivacionEmpresaConsultaFila;
  gestionPendiente?: ActivacionEmpresaGestionPayload;
  enableAction = false;

  first = 0;
  page = 1;
  rows = 10;
  totalRows = 0;

  constructor(
    private userService: Users,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarConsulta();
  }

  get esPorGestionar(): boolean {
    return this.estadoGestion === 'POR_GESTIONAR';
  }

  onEstadoGestionChange(): void {
    this.first = 0;
    this.page = 1;
    this.cargarConsulta();
  }

  onPageChange(event: PaginatorState): void {
    this.first = event.first || 0;
    this.rows = event.rows || 10;
    this.page = Number(event.page) + 1 || 1;
    this.cargarConsulta();
  }

  applyFilter(): void {
    this.first = 0;
    this.page = 1;
    this.cargarConsulta();
  }

  clearFilter(): void {
    this.tipoDocumentoEmpresa = '';
    this.numeroDocumentoEmpresa = '';
    this.first = 0;
    this.page = 1;
    this.cargarConsulta();
  }

  private buildConsultaPayload(): ConsultarActivacionEmpresaPayload {
    const payload: ConsultarActivacionEmpresaPayload = {
      estado_gestion: this.estadoGestion,
      page: this.page,
      page_size: this.rows,
    };
    const tipo = this.tipoDocumentoEmpresa?.trim();
    const numero = this.numeroDocumentoEmpresa?.trim();
    if (tipo) {
      payload.tipo_documento_empresa = tipo;
    }
    if (numero) {
      payload.numero_documento_empresa = numero;
    }
    return payload;
  }

  cargarConsulta(): void {
    this.userService.consultarActivacionEmpresa(this.buildConsultaPayload()).subscribe({
      next: (response: BodyResponse<ActivacionEmpresaConsultaFila[]>) => {
        if (response.code === 200) {
          this.registros = response.data || [];
          this.totalRows = Number(response.message) || 0;
        } else {
          this.registros = [];
          this.totalRows = 0;
          this.showMessage('error', 'Fallida', response.message || 'Operación fallida');
        }
      },
      error: () => {
        this.registros = [];
        this.totalRows = 0;
        this.showMessage('error', 'Error', 'No se pudo consultar la activación de empresa');
      },
    });
  }

  abrirGestionar(fila: ActivacionEmpresaConsultaFila): void {
    if (!fila?.puede_gestionar) {
      return;
    }
    this.empresaSeleccionada = fila;
    this.visibleDialogGestionar = true;
  }

  cerrarModalGestionar(value: boolean): void {
    this.visibleDialogGestionar = false;
    this.enableAction = value;
  }

  recibirDatosGestion(payload: ActivacionEmpresaGestionPayload): void {
    if (!this.enableAction) {
      return;
    }
    this.gestionPendiente = payload;
    this.message = '¿Confirma la gestión de activación de empresa?';
    this.visibleDialogConfirmacion = true;
  }

  cerrarConfirmacion(value: boolean): void {
    this.visibleDialogConfirmacion = false;
    if (!value || !this.gestionPendiente) {
      this.visibleDialogGestionar = true;
      return;
    }
    this.ejecutarGestion();
  }

  private ejecutarGestion(): void {
    if (!this.gestionPendiente) {
      return;
    }
    const payload = this.gestionPendiente;
    this.userService.gestionarActivacionEmpresa(payload).subscribe({
      next: (response: BodyResponse<ActivacionEmpresaGestionResultado>) => {
        if (response.code === 200) {
          this.showMessage('success', 'Exitoso', 'Gestión realizada con éxito');
          this.gestionPendiente = undefined;
          this.cargarConsulta();
        } else {
          this.message = response.message || 'Operación fallida';
          this.informative = true;
          this.severity = 'danger';
          this.visibleDialogAlert = true;
        }
      },
      error: (err) => {
        const msg =
          err?.error?.message ||
          err?.message ||
          'No se pudo completar la gestión de activación de empresa';
        this.message = msg;
        this.informative = true;
        this.severity = 'danger';
        this.visibleDialogAlert = true;
      },
    });
  }

  cerrarAlerta(): void {
    this.visibleDialogAlert = false;
  }

  textoFechaGestion(fila: ActivacionEmpresaConsultaFila): string {
    if (!fila?.sinc_fecha) {
      return '';
    }
    const quitarMilisegundos = (valor: string) =>
      valor.replace(/(\d{2}:\d{2}:\d{2})\.\d+/, '$1');

    const fecha = quitarMilisegundos(String(fila.sinc_fecha).trim().replace('T', ' '));
    if (/\d{1,2}:\d{2}:\d{2}/.test(fecha)) {
      return fecha;
    }
    const hora = fila.sinc_hora
      ? quitarMilisegundos(String(fila.sinc_hora).trim())
      : '';
    return hora ? `${fecha} ${hora}` : fecha;
  }

  private showMessage(state: string, title: string, detail: string): void {
    this.messageService.add({ severity: state, summary: title, detail });
  }
}
