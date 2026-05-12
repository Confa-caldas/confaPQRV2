import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  PaymentMethodRequestDetails,
  RequestPaymentMethodStatusList,
  PaymentMethodProcessStatusList,
  TransferProcessStatusList,
  AssignManagementUser,
  AnswerPaymentMethodRequest,
  Pagination,
  RequestHistoricPaymentMethodRequest,
  PreSignedAttach,
  ApplicantAttachments,
  ErrorAttachLog,
  TransferStatusList,
} from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';
import { SessionStorageItems } from '../../../enums/session-storage-items.enum';
import { firstValueFrom, lastValueFrom, throwError } from 'rxjs';
import { retryWhen, delay, take, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-payment-method-request-details',
  templateUrl: './payment-method-request-details.component.html',
  styleUrl: './payment-method-request-details.component.scss',
})
export class PaymentMethodRequestDetailsComponent implements OnInit {
  isSpinnerVisible = false;

  requestDetails?: PaymentMethodRequestDetails;
  request_id: number = 0;

  requestHistoric: RequestHistoricPaymentMethodRequest[] = [];

  // Índice activo de las pestañas (0-based)
  activeTabIndex: number = 0;

  firstHistoric: number = 0;
  pageHistoric: number = 1;
  rowsHistoric: number = 10;
  totalRowsHistoric: number = 0;

  visibleDialog = false;
  message = '';
  user!: string;
  PERFIL!: string;
  visibleDialogInput = false;
  enableAssign: boolean = false;
  filingNumber: string = '';
  loggedUserName: string = '';

  // Flag to control if process lists have been loaded
  private processListsLoaded = false;

  // UI form for "Tramitar solicitud"
  processForm!: FormGroup;
  medioPagoStatusOptions: { label: string; value: number }[] = [];
  trasladoStatusOptions: { label: string; value: number }[] = [];
  // Lista filtrada que se mostrará en el dropdown de traslado según selección de medioPago
  trasladoStatusFiltered: { label: string; value: number }[] = [];
  requestStatusOptions: { label: string; value: number }[] = [];
  // Catálogo completo de estados de solicitud (incluye "tramitada" y "radicada"), usado para resolver IDs por nombre
  private allRequestStatuses: { label: string; value: number }[] = [];
  transferenciaStatusOptions: { label: string; value: number }[] = [];
  showRequestStatus: boolean = false;

  // Propiedades para manejo de archivos adjuntos
  selectedAttachmentFile: File | null = null;
  errorSizeAttachmentFile = false;
  errorExtensionAttachmentFile = false;
  errorMensajeAttachmentFile = '';
  uploadProgress = 0;

  // Propiedades para visualización de adjuntos
  displayPreviewModal: boolean = false;
  viewerType: 'google' | 'office' | 'image' | 'pdf' = 'google';
  preSignedUrl: string = '';
  preSignedUrlDownload: string = '';

  constructor(
    private userService: Users,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private http: HttpClient,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.PERFIL = sessionStorage.getItem(SessionStorageItems.PERFIL) || '';
    this.user = sessionStorage.getItem(SessionStorageItems.USER) || '';

    this.route.params.subscribe(params => {
      this.request_id = +params['id'];
      this.getPaymentMethodRequestDetails(this.request_id);
    });
    this.initPaginadorHistoric();

    this.buildProcessForm();
  }

  onPageChangeHistoric(eventHistoric: PaginatorState) {
    this.firstHistoric = eventHistoric.first || 0;
    this.rowsHistoric = eventHistoric.rows || 0;
    this.pageHistoric = Number(eventHistoric.page) + 1 || 0;
    this.getRequestHistoric(this.request_id);
  }

  cleanFormHistoric() {
    this.firstHistoric = 0;
    this.pageHistoric = 1;
    this.rowsHistoric = 10;
    this.requestHistoric = [];
    this.getRequestHistoric(this.request_id);
  }

  initPaginadorHistoric() {
    this.firstHistoric = 0;
    this.pageHistoric = 1;
    this.rowsHistoric = 10;
    this.getRequestHistoric(this.request_id);
  }

  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }

  getPaymentMethodRequestDetails(request_id: number) {
    this.userService.getPaymentMethodRequestDetails(request_id).subscribe({
      next: (response: BodyResponse<PaymentMethodRequestDetails>) => {
        if (response.code === 200) {
          this.requestDetails = response.data;
          this.updateFormValidators();
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.error(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }

  getRequestHistoric(request_id: number) {
    const payload: Pagination = {
      request_id: request_id,
      page: this.pageHistoric,
      page_size: this.rowsHistoric,
    };
    this.userService.getPaymentMethodRequestHistoric(payload).subscribe({
      next: (response: BodyResponse<RequestHistoricPaymentMethodRequest[]>) => {
        if (response.code === 200) {
          this.requestHistoric = response.data;
          this.totalRowsHistoric = Number(response.message);
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

  private buildProcessForm() {
    this.processForm = this.fb.group({
      medioPagoStatus: [null],
      trasladoStatus: [null],
      requestStatus: [{ value: null, disabled: true }],
      observations: [{ value: '', disabled: true }, [Validators.maxLength(100)]],
      pagoStatus: [null],
      attachment: [{ value: null, disabled: true }],
    });

    // Suscripción para medioPagoStatus: además de actualizar estado, filtrará las opciones de traslado
    this.processForm.get('medioPagoStatus')!.valueChanges.subscribe(medioVal => {
      // Identificar ids por label (si no están cargadas las opciones, mantener las opciones completas)
      const aplicadoId = this.medioPagoStatusOptions.find(opt => opt.label.toLowerCase() === 'aplicado')?.value;
      const noAplicadoId = this.medioPagoStatusOptions.find(opt => opt.label.toLowerCase() === 'no aplicado')?.value;

      if (medioVal === aplicadoId) {
        // Permitir solo las opciones Aplicado con saldo y Aplicado sin saldo
        this.trasladoStatusFiltered = this.trasladoStatusOptions.filter(
          opt => opt.label.toLowerCase() === 'aplicado con saldo' || opt.label.toLowerCase() === 'aplicado sin saldo'
        );
      } else if (medioVal === noAplicadoId) {
        // Permitir solo No aplicado
        this.trasladoStatusFiltered = this.trasladoStatusOptions.filter(opt => opt.label.toLowerCase() === 'no aplicado');
      } else {
        // Si no hay selección o valores inesperados, mostrar todas
        this.trasladoStatusFiltered = [...this.trasladoStatusOptions];
      }

      // Si el valor seleccionado actualmente en traslado no está dentro del filtrado, limpiarlo
      const trasladoControl = this.processForm.get('trasladoStatus')!;
      if (trasladoControl && !this.trasladoStatusFiltered.some(opt => opt.value === trasladoControl.value)) {
        trasladoControl.setValue(null);
      }

      this.updateRequestStatusState();
    });

    this.processForm.get('trasladoStatus')!.valueChanges.subscribe(() => {
      this.updateRequestStatusState();
    });

    // Show/hide observations for rejection
    this.processForm.get('requestStatus')!.valueChanges.subscribe(val => {
      const obs = this.processForm.get('observations')!;
      if (val === 3) {
        obs.enable();
        obs.addValidators([Validators.required, Validators.maxLength(100)]);
      } else {
        obs.clearValidators();
        obs.setValue('');
        obs.disable();
      }
      obs.updateValueAndValidity();
    });

    this.processForm.get('pagoStatus')!.valueChanges.subscribe(val => {
      const attachment = this.processForm.get('attachment')!;
      if (val === 2) {
        attachment.enable();
        attachment.addValidators([Validators.required]);
      } else {
        attachment.clearValidators();
        attachment.setValue(null);
        attachment.disable();
      }
      attachment.updateValueAndValidity();
    });
  }

  // Update form validators based on request status
  private updateFormValidators(): void {
    if (!this.requestDetails) return;

    const medioPagoControl = this.processForm.get('medioPagoStatus')!;
    const trasladoControl = this.processForm.get('trasladoStatus')!;
    const requestStatusControl = this.processForm.get('requestStatus')!;
    const pagoStatusControl = this.processForm.get('pagoStatus')!;

    // Si el estado es 'No termino', el campo es requerido
    if (this.requestDetails.payment_method_process_status_name.toLowerCase() === 'no termino') {
      medioPagoControl.setValidators([Validators.required]);
    } else {
      medioPagoControl.clearValidators();
      medioPagoControl.setValue(null);
    }

    if (this.requestDetails.transfer_process_status_name.toLowerCase() === 'no termino') {
      trasladoControl.setValidators([Validators.required]);
    } else {
      trasladoControl.clearValidators();
      trasladoControl.setValue(null);
    }

    if (this.requestDetails.payment_method_status_name.toLowerCase() === 'radicada') {
      requestStatusControl.setValidators([Validators.required]);
    } else {
      requestStatusControl.clearValidators();
      requestStatusControl.setValue(null);
    }

    if (
      this.requestDetails.payment_method_status_name.toLowerCase() === 'tramitada' &&
      this.requestDetails.transfer_process_status_name.toLowerCase() === 'aplicado con saldo'
    ) {
      pagoStatusControl.setValidators([Validators.required]);
    } else {
      pagoStatusControl.clearValidators();
      pagoStatusControl.setValue(null);
    }

    medioPagoControl.updateValueAndValidity();
    trasladoControl.updateValueAndValidity();
    requestStatusControl.updateValueAndValidity();
    pagoStatusControl.updateValueAndValidity();
  }

  // Crear el método updateRequestStatusState():
  private updateRequestStatusState(): void {
    const medioPagoValue = this.processForm.get('medioPagoStatus')!.value;
    const trasladoValue = this.processForm.get('trasladoStatus')!.value;
    const requestStatusControl = this.processForm.get('requestStatus')!;

    // Buscar el ID de "No aplicado" en las opciones cargadas
    const medioPagoNoAplicadoId = this.medioPagoStatusOptions.find(
      opt => opt.label.toLowerCase() === 'no aplicado'
    )?.value;

    const trasladoNoAplicadoId = this.trasladoStatusOptions.find(
      opt => opt.label.toLowerCase() === 'no aplicado'
    )?.value;

    // Habilitar solo si AMBOS son "No aplicado"
    if (medioPagoValue === medioPagoNoAplicadoId && trasladoValue === trasladoNoAplicadoId) {
      this.showRequestStatus = true;
      requestStatusControl.enable();
      requestStatusControl.setValidators([Validators.required]);
    } else {
      this.showRequestStatus = false;
      requestStatusControl.disable();
      requestStatusControl.clearValidators();
      requestStatusControl.setValue(null);
    }
    requestStatusControl.updateValueAndValidity();
  }

  // Tab change handler
  onTabChange(event: any): void {
    // Si es el tab "Tramitar solicitud" (índice 3) y no se han cargado las listas
    if (event.index === 3 && !this.processListsLoaded) {
      this.loadProcessLists();
    } else if (event.index == 1) {
      this.initPaginadorHistoric();
    }
  }

  // Load process lists from API
  loadProcessLists(): void {
    this.isSpinnerVisible = true;

    // 1. Estado solicitud (Request Payment Method Status)
    this.userService.getRequestPaymentMethodStatusList().subscribe({
      next: (response: BodyResponse<RequestPaymentMethodStatusList[]>) => {
        if (response.code === 200) {
          this.allRequestStatuses = response.data.map(item => ({
            label: item.payment_method_status_name,
            value: item.payment_method_status_id,
          }));

          this.requestStatusOptions = this.allRequestStatuses.filter(
            item =>
              item.label.toLowerCase() !== 'radicada' && item.label.toLowerCase() !== 'tramitada'
          );
        }
      },
      error: (err: any) => {
        console.error('Error loading request status list:', err);
        this.showSuccessMessage(
          'error',
          'Error',
          'No se pudo cargar la lista de estados de solicitud'
        );
      },
    });

    // 2. Estado gestión medio de pago (Payment Method Process Status)
    this.userService.getPaymentMethodProcessStatusList().subscribe({
      next: (response: BodyResponse<PaymentMethodProcessStatusList[]>) => {
        if (response.code === 200) {
          this.medioPagoStatusOptions = response.data
            .filter(
              item =>
                item.payment_method_process_status_name.toLowerCase() === 'no aplicado' ||
                item.payment_method_process_status_name.toLowerCase() === 'aplicado'
            )
            .map(item => ({
              label: item.payment_method_process_status_name,
              value: item.payment_method_process_status_id,
            }));
        }
      },
      error: (err: any) => {
        console.error('Error loading payment method process status list:', err);
        this.showSuccessMessage(
          'error',
          'Error',
          'No se pudo cargar la lista de estados de medio de pago'
        );
      },
    });

    // 3. Estado gestión traslado (Transfer Process Status)
    this.userService.getTransferProcessStatusList().subscribe({
      next: (response: BodyResponse<TransferProcessStatusList[]>) => {
        if (response.code === 200) {
          this.trasladoStatusOptions = response.data
            .filter(
              item =>
                item.transfer_process_status_name.toLowerCase() === 'aplicado con saldo' ||
                item.transfer_process_status_name.toLowerCase() === 'aplicado sin saldo' ||
                item.transfer_process_status_name.toLowerCase() === 'no aplicado'
            )
            .map(item => ({
              label: item.transfer_process_status_name,
              value: item.transfer_process_status_id,
            }));
          // Inicializar la lista filtrada con todas las opciones por defecto
          this.trasladoStatusFiltered = [...this.trasladoStatusOptions];
        }
      },
      error: (err: any) => {
        console.error('Error loading transfer process status list:', err);
        this.showSuccessMessage(
          'error',
          'Error',
          'No se pudo cargar la lista de estados de traslado'
        );
      },
    });

    // 4. Estado traslado (Transfer Status)
    this.userService.getTransferStatusList().subscribe({
      next: (response: BodyResponse<TransferStatusList[]>) => {
        if (response.code === 200) {
          this.transferenciaStatusOptions = response.data.map(item => ({
            label: item.transfer_status_name,
            value: item.transfer_status_id,
          }));
        }
      },
      error: (err: any) => {
        console.error('Error loading transfer status list:', err);
        this.showSuccessMessage(
          'error',
          'Error',
          'No se pudo cargar la lista de estados de resultado transferencia'
        );
      },
      complete: () => {
        this.isSpinnerVisible = false;
        this.processListsLoaded = true;
      },
    });
  }

  // Placeholder save handler for visual phase
  onSaveProcess() {
    if (this.processForm.invalid) {
      this.processForm.markAllAsTouched();
      this.showSuccessMessage('warn', 'Validación', 'Complete los campos requeridos');
      return;
    }

    // Mostrar modal de confirmación
    this.message = '¿Está seguro que desea guardar los cambios de la solicitud?';
    this.visibleDialog = true;
  }

  assignRequest() {
    // Asignar los valores para el modal
    this.filingNumber = this.requestDetails?.filing_number || '';
    this.loggedUserName = this.user;
    // Mostrar el modal
    this.visibleDialogInput = true;
  }

  closeDialogInput(value: boolean) {
    this.visibleDialogInput = false;
    this.enableAssign = value;
    if (value) {
      // Preparar el payload para asignar la solicitud
      const payload: AssignManagementUser = {
        request_id: this.request_id,
        internal_management: true,
        internal_management_user: this.user,
      };

      this.isSpinnerVisible = true;

      // Llamar al servicio para guardar la asignación
      this.userService.assignManagementUserToRequest(payload).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            this.showSuccessMessage(
              'success',
              'Solicitud Asignada',
              `La solicitud ${this.filingNumber} ha sido asignada a ${this.loggedUserName}`
            );
            // Recargar los detalles de la solicitud para reflejar el cambio
            this.getPaymentMethodRequestDetails(this.request_id);
            setTimeout(() => {
              this.activeTabIndex = 3;
              try {
                this.loadProcessLists();
                this.changeDetectorRef.detectChanges();
              } catch (e) {
                console.error('Error al forzar la detección de cambios:', e);
              }
            }, 300);
          } else {
            this.showSuccessMessage('error', 'Error', 'No se pudo asignar la solicitud');
          }
        },
        error: (err: any) => {
          console.error('Error al asignar solicitud:', err);
          this.showSuccessMessage('error', 'Error', 'Ocurrió un error al asignar la solicitud');
          this.isSpinnerVisible = false;
        },
        complete: () => {
          this.isSpinnerVisible = false;
        },
      });
    }
  }

  /**
   * Resuelve el ID del estado de la solicitud (payment_method_status_id) que se enviará en el payload.
   *
   * Reglas:
   * 1. Si el usuario seleccionó manualmente un estado en el dropdown (caso "No aplicado" + "No aplicado"),
   *    se respeta esa selección.
   * 2. Si "Estado gestión medio de pago" = "Aplicado" y "Estado gestión traslado" es "Aplicado con saldo"
   *    o "Aplicado sin saldo", se resuelve automáticamente como "Tramitada".
   * 3. En cualquier otro caso, retorna 0 (comportamiento previo).
   *
   * Los IDs se buscan por nombre en los catálogos cargados para evitar hardcodear valores del backend.
   */
  private resolveRequestStatusId(): number {
    const manual = this.processForm.get('requestStatus')?.value;
    if (manual) {
      return manual;
    }

    const medioPagoAplicadoId = this.medioPagoStatusOptions.find(
      opt => opt.label.toLowerCase() === 'aplicado'
    )?.value;

    const trasladoIdsAplicado = this.trasladoStatusOptions
      .filter(
        opt =>
          opt.label.toLowerCase() === 'aplicado con saldo' ||
          opt.label.toLowerCase() === 'aplicado sin saldo'
      )
      .map(opt => opt.value);

    const tramitadaId = this.allRequestStatuses.find(
      opt => opt.label.toLowerCase() === 'tramitada'
    )?.value;

    const medioPagoValue = this.processForm.get('medioPagoStatus')?.value;
    const trasladoValue = this.processForm.get('trasladoStatus')?.value;

    const esTramitada =
      medioPagoValue === medioPagoAplicadoId && trasladoIdsAplicado.includes(trasladoValue);

    if (esTramitada && tramitadaId) {
      return tramitadaId;
    }

    return 0;
  }

  closeDialog(value: boolean) {
    this.visibleDialog = false;
    if (value) {
      // Usuario confirmó - ejecutar el guardado
      const payload: AnswerPaymentMethodRequest = {
        request_id: this.request_id,
        payment_method_status_id: this.resolveRequestStatusId(),
        payment_method_process_status_id: this.processForm.get('medioPagoStatus')?.value || 0,
        transfer_process_status_id: this.processForm.get('trasladoStatus')?.value || 0,
        observations: this.processForm.get('observations')?.value || '',
        internal_management_user: this.user,
        transfer_status_id: this.processForm.get('pagoStatus')?.value || 0,
      };

      console.log('Payload para guardar la solicitud:', payload);

      this.isSpinnerVisible = true;

      // Llamar al servicio para guardar la respuesta de la solicitud
      this.userService.answerPaymentMethodRequest(payload).subscribe({
        next: async (response: BodyResponse<string>) => {
          if (response.code === 200) {
            // Si hay un archivo seleccionado, subirlo después de guardar la solicitud
            if (this.selectedAttachmentFile) {
              try {
                await this.attachPaymentFile(this.request_id);
                this.showSuccessMessage(
                  'success',
                  'Guardado Exitoso',
                  'La solicitud y el archivo han sido procesados correctamente'
                );
              } catch (error) {
                console.error('Error al subir el archivo:', error);
                this.showSuccessMessage(
                  'warn',
                  'Guardado Parcial',
                  'La solicitud fue guardada pero hubo un error al subir el archivo'
                );
              }
            } else {
              this.showSuccessMessage(
                'success',
                'Guardado Exitoso',
                'La solicitud ha sido procesada correctamente'
              );
            }

            // Recargar los detalles de la solicitud para reflejar el cambio
            this.getPaymentMethodRequestDetails(this.request_id);
          } else {
            this.showSuccessMessage('error', 'Error', 'No se pudo procesar la solicitud');
          }
        },
        error: (err: any) => {
          console.error('Error al procesar solicitud:', err);
          this.showSuccessMessage('error', 'Error', 'Ocurrió un error al procesar la solicitud');
          this.isSpinnerVisible = false;
        },
        complete: () => {
          this.isSpinnerVisible = false;
        },
      });
    }
  }

  // Métodos para manejo de archivos adjuntos
  onAttachmentFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const maxFileSize = 20971520; // 20 MB en bytes
    const allowedExtensions = ['.jpeg', '.jpg', '.png', '.pdf', '.xls', '.xlsx', '.doc', '.docx'];

    // Resetear errores
    this.errorSizeAttachmentFile = false;
    this.errorExtensionAttachmentFile = false;
    this.errorMensajeAttachmentFile = '';

    // Validar tamaño del archivo
    if (file.size > maxFileSize) {
      this.errorSizeAttachmentFile = true;
      this.errorMensajeAttachmentFile = 'El archivo excede el tamaño máximo permitido de 20 MB';
      this.selectedAttachmentFile = null;
      this.processForm.get('attachment')?.setValue(null);
      input.value = '';
      return;
    }

    // Validar extensión del archivo
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      this.errorExtensionAttachmentFile = true;
      this.errorMensajeAttachmentFile = 'Formato de archivo no permitido';
      this.selectedAttachmentFile = null;
      this.processForm.get('attachment')?.setValue(null);
      input.value = '';
      return;
    }

    // Si todo está bien, guardar el archivo
    this.selectedAttachmentFile = file;
    this.processForm.get('attachment')?.setValue(file.name);
    this.processForm.get('attachment')?.markAsTouched();
  }

  openAttachmentFileInput(): void {
    const fileInput = document.querySelector('input[name="attachment_file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  clearAttachmentFile(): void {
    this.selectedAttachmentFile = null;
    this.processForm.get('attachment')?.setValue(null);
    this.errorSizeAttachmentFile = false;
    this.errorExtensionAttachmentFile = false;
    this.errorMensajeAttachmentFile = '';

    const fileInput = document.querySelector('input[name="attachment_file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Métodos para subir archivos a S3
  async getPreSignedUrlPayment(file: ApplicantAttachments, request_id: number): Promise<string> {
    const payload = {
      source_name: file.source_name.replace(/(?!\.[^.]+$)\./g, '_'), // Evitar caracteres conflictivos
      fileweight: file.fileweight,
      request_id: request_id,
      content_type: file.file?.type || 'application/octet-stream',
    };

    const MAX_RETRIES = 3;
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
      try {
        const response = await firstValueFrom(
          this.userService.getUrlSignedPaymentMethodRequest(payload, 'payment_method')
        );

        if (response.code === 200 && response.data) {
          return response.data;
        } else {
          console.error(`Intento ${attempts + 1}: Error al obtener URL prefirmada`, response);
        }
      } catch (error) {
        console.error(
          `Intento ${attempts + 1}: Falló la solicitud para obtener la URL prefirmada`,
          error
        );
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('No se pudo obtener la URL prefirmada después de múltiples intentos');
  }

  async uploadToPresignedUrlPayment(file: ApplicantAttachments, request_id: number): Promise<void> {
    if (!file || !file.file) {
      console.error('El archivo no es válido o está undefined.');
      return;
    }

    if (!file.preSignedUrl) {
      console.error(`No se encontró una URL prefirmada para el archivo: ${file.source_name}`);
      return;
    }

    try {
      const contentType = file.file?.type || 'application/octet-stream';
      const MAX_RETRIES = 3;
      const RETRY_DELAY_MS = 2000;

      console.log('Subiendo archivo:', file.file.name);
      console.log('Usando URL prefirmada:', file.preSignedUrl);

      const upload$ = this.http
        .put(file.preSignedUrl, file.file, {
          headers: { 'Content-Type': contentType },
          reportProgress: true,
          observe: 'events',
        })
        .pipe(
          retryWhen(errors =>
            errors.pipe(
              tap((error: HttpErrorResponse) => {
                const errorDetails = {
                  status: error.status,
                  statusText: error.statusText,
                  message: error.message,
                  url: error.url,
                };
                console.error(`Intento fallido (${error.status}):`, errorDetails);

                if (![500, 502, 503, 504, 429].includes(error.status)) {
                  throw error;
                }

                // this.handleUploadFailurePayment(file, request_id, errorDetails);
              }),
              delay(RETRY_DELAY_MS),
              take(MAX_RETRIES),
              catchError(err => {
                console.error('Error después de múltiples intentos:', err);
                return throwError(() => err);
              })
            )
          )
        );

      await lastValueFrom(upload$);
      console.log(`Archivo ${file.file.name} subido correctamente.`);
    } catch (error) {
      console.error('Falló la subida del archivo:', error);
      throw error;
    }
  }

  handleUploadFailurePayment(file: ApplicantAttachments, request_id: number, errorDetails: any) {
    const payload: ErrorAttachLog = {
      request_id: request_id,
      status: 'REPORTADO',
      name_archive: file.source_name,
      error_message: JSON.stringify(errorDetails),
      error_type: 'UPLOAD_FAILURE',
    };

    this.userService.registerErrorAttach(payload).subscribe({
      next: (response: BodyResponse<string>) => {
        if (response.code === 200) {
          console.log('Error registrado en la base de datos.');
        }
      },
      error: (err: any) => {
        console.error('Error al registrar el fallo:', err);
      },
    });
  }

  async retry<T>(operation: () => Promise<T>, retries: number, delayMs: number): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    throw new Error('Retry failed');
  }

  async attachPaymentFile(request_id: number): Promise<void> {
    if (!this.selectedAttachmentFile) {
      console.warn('No hay archivo para subir.');
      return;
    }

    this.uploadProgress = 0;

    try {
      // Convertir el archivo a base64
      const base64file = await this.convertFileToBase64(this.selectedAttachmentFile);

      const fileAttachment: ApplicantAttachments = {
        base64file: base64file,
        source_name: this.selectedAttachmentFile.name,
        fileweight: this.selectedAttachmentFile.size.toString(),
        file: this.selectedAttachmentFile,
        preSignedUrl: '',
      };

      // Paso 1: Enviar archivo al servidor (base de datos)
      const ruta_archivo_ws = environment.ruta_archivos_ws;
      const estructura = {
        idSolicitud: `${request_id}`,
        archivos: [
          {
            base64file: fileAttachment.base64file,
            source_name: fileAttachment.source_name,
            fileweight: fileAttachment.fileweight,
          },
        ],
      };

      try {
        await this.envioArchivosServer(ruta_archivo_ws, estructura);
        console.log('Archivo registrado en base de datos correctamente');
      } catch (error) {
        console.error('Error al enviar archivo al servidor:', error);
        throw error;
      }

      // Paso 2: Obtener URL prefirmada
      const preSignedUrl = await this.retry(
        () => this.getPreSignedUrlPayment(fileAttachment, request_id),
        1,
        2000
      );

      console.log('URL prefirmada obtenida:', preSignedUrl);

      if (!preSignedUrl) {
        throw new Error('No se pudo obtener la URL prefirmada');
      }

      fileAttachment.preSignedUrl = preSignedUrl;

      // Paso 3: Subir archivo a S3 con preSigned URL
      await this.retry(() => this.uploadToPresignedUrlPayment(fileAttachment, request_id), 3, 3000);

      this.uploadProgress = 100;
      this.changeDetectorRef.detectChanges();

      console.log('Archivo subido correctamente a S3');
    } catch (error) {
      console.error('Error durante el proceso de carga del archivo:', error);
      throw error;
    } finally {
      setTimeout(() => {
        this.uploadProgress = 0;
      }, 500);
    }
  }

  // Método para enviar archivos al servidor (base de datos)
  async envioArchivosServer(ruta: string, estructura: any): Promise<void> {
    try {
      const archivos = estructura.archivos;
      const totalArchivos = archivos.length;

      for (let i = 0; i < totalArchivos; i++) {
        const archivo = archivos[i];

        // Subir cada archivo de manera individual
        await this.http.post(ruta, { ...estructura, archivos: [archivo] }).toPromise();

        this.uploadProgress = Math.round(((i + 1) / totalArchivos) * 50);
        this.changeDetectorRef.detectChanges(); // Forzar actualización de la UI
      }
    } catch (error) {
      console.error('Error al subir archivos:', error);
    }
  }

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remover el prefijo data:image/png;base64, o similar
        const base64Content = base64String.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = error => reject(error);
    });
  }

  // === MÉTODOS PARA ADJUNTOS ===

  // Extraer el nombre del archivo de la URL
  // Formato: https://...../16_ejemploarchivo.pdf@22013
  getFileName(attachmentUrl: string): string {
    if (!attachmentUrl) return '';

    // Separar la URL del peso (antes del @)
    const urlWithoutSize = attachmentUrl.split('@')[0];

    // Extraer el nombre del archivo de la URL
    const urlParts = urlWithoutSize.split('/');
    const fileName = urlParts[urlParts.length - 1];

    return fileName || 'Archivo adjunto';
  }

  // Extraer la extensión del archivo
  getFileExtension(attachmentUrl: string): string {
    if (!attachmentUrl) return '';

    const fileName = this.getFileName(attachmentUrl);
    const extension = fileName.split('.').pop();

    return extension ? `.${extension.toUpperCase()}` : '';
  }

  // Extraer el peso del archivo
  // El peso viene después del @ en KB
  getFileSize(attachmentUrl: string): string {
    if (!attachmentUrl) return '';

    const parts = attachmentUrl.split('@');
    if (parts.length < 2) return '';

    const sizeInKB = parseInt(parts[1]);
    if (isNaN(sizeInKB)) return '';

    // Convertir a MB si es mayor a 1024 KB
    if (sizeInKB >= 1024) {
      const sizeInMB = (sizeInKB / 1024).toFixed(2);
      return `${sizeInMB} MB`;
    }

    return `${sizeInKB} KB`;
  }

  // Obtener URL prefirmada y mostrar/descargar archivo
  getPreSignedUrlToDownload(attachmentUrl: string, isDownload: boolean): void {
    if (!attachmentUrl) return;

    // Extraer solo la URL (sin el peso)
    const url = attachmentUrl.split('@')[0];
    const fileName = this.getFileName(attachmentUrl);

    const payload = { url: url };

    this.userService.getUrlSignedPaymentMethodRequest(payload, 'download').subscribe({
      next: (response: BodyResponse<string>): void => {
        if (response.code === 200) {
          this.preSignedUrlDownload = response.data;
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
        this.showSuccessMessage('error', 'Error', 'No se pudo obtener la URL del archivo');
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
        this.viewerType = this.getViewerType(fileName);

        if (!isDownload) {
          if (this.viewerType === 'pdf') {
            this.isSpinnerVisible = true;
            this.displayFileInTab(this.preSignedUrlDownload, fileName);
          } else {
            this.preSignedUrl = this.preSignedUrlDownload;
            this.displayPreviewModal = true;
          }
        } else {
          this.downloadFileS3(this.preSignedUrlDownload, fileName);
        }
      },
    });
  }

  // Determinar el tipo de visor según la extensión del archivo
  getViewerType(fileName: string): 'image' | 'pdf' | 'google' {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      default:
        return 'google';
    }
  }

  // Abrir PDF en nueva pestaña
  displayFileInTab(url: string, fileName: string): void {
    this.userService
      .downloadFileFromS3(url)
      .toPromise()
      .then((blob: Blob | undefined) => {
        if (blob) {
          return this.blobToBase64(blob);
        } else {
          throw new Error('Downloaded file is undefined');
        }
      })
      .then((base64String: string) => {
        const fileType = fileName.split('.');
        const file_extension = fileType[fileType.length - 1];
        const dataUrl = 'data:application/pdf;base64,' + base64String;
        this.convertBase64ToBlobAndOpenInNewTab(base64String, fileName, file_extension);
      })
      .catch(error => {
        console.error('Error downloading file:', error);
      });
  }

  // Descargar archivo desde S3
  downloadFileS3(url: string, fileName: string): void {
    this.userService.downloadFileFromS3(url).subscribe(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
      }, 0);
    });
  }

  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data: string = reader.result as string;
        // Remove the header (data:image/png;base64,) to get only the base64-encoded content
        const base64Content = base64Data.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = error => {
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  }

  convertBase64ToBlobAndOpenInNewTab(
    base64String: string,
    fileName: string,
    file_extension: string
  ): void {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    let mimeType;
    if (file_extension === 'pdf') {
      mimeType = 'application/' + file_extension;
    } else {
      mimeType = 'image/' + file_extension;
    }

    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    //const newTab = window.open(url, '_blank');

    // Definir las dimensiones de la ventana emergente
    const windowWidth = 800;
    const windowHeight = 600;

    // Calcular la posición centrada
    const left = window.screen.width / 2 - windowWidth / 2;
    const top = window.screen.height / 2 - windowHeight / 2;

    // Definir las características de la nueva ventana con las posiciones calculadas
    const windowFeatures = `width=${windowWidth},height=${windowHeight},scrollbars=yes,resizable=yes,left=${left},top=${top}`;
    this.isSpinnerVisible = false;
    // Abrir la nueva ventana con las características definidas
    const newWindow = window.open(url, 'miventana', windowFeatures);

    URL.revokeObjectURL(url);
  }
}
