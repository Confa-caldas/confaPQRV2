import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import {
  ApplicantAttachments,
  ApplicantTypeList,
  RequestFormList,
  RequestTypeList,
  ErrorAttachLog,
  ProcessRequest,
  PendingRequest,
  Token,
  RequestFormListPending,
} from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutesApp } from '../../../enums/routes.enum';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { HttpEventType, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { throwError, retry, lastValueFrom, firstValueFrom } from 'rxjs';
import { catchError, retryWhen, delay, take, tap } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { CheckboxChangeEvent } from 'primeng/checkbox';

@Component({
  selector: 'app-request-pending',
  templateUrl: './request-pending.component.html',
  styleUrl: './request-pending.component.scss',
})
export class RequestPendingComponent implements OnInit {
  @ViewChild('archive_request') fileInput!: ElementRef;

  requestForm: FormGroup;

  documentList!: [];
  document!: string;
  applicantType!: ApplicantTypeList;
  requestType!: RequestTypeList;
  arrayApplicantAttachment: ApplicantAttachments[] = [];
  fileNameList: Set<string> = new Set();
  selectedFiles: FileList | null = null;
  base64String: string = '';
  option: string[] = [];
  errorSizeFile!: boolean;
  errorExtensionFile!: boolean;
  errorRepeatFile!: boolean;
  errorMensaje!: string;
  errorMensajeDisabled!: string;
  errorMensajeFile!: string;
  visibleDialogAlert = false;
  informative: boolean = false;
  isError: boolean = false;
  severity = '';
  message = '';
  tittle_message = '';
  enableAction: boolean = false;
  loadingAttachments: boolean = false;
  optionDefault!: string;
  optionsCompany = [
    {
      catalog_item_id: 1,
      catalog_item_name: 'NIT',
      regex: '^[0-9]{0,9}$',
    },
  ];
  value!: {};
  preSignedUrl: string = '';
  selectedFile: File | null = null;
  numeroDocumentoIngresado: boolean = false;

  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  resolveModal!: () => void; // Función para resolver la promesa

  isUploading: boolean = false;
  uploadProgress = 0;
  visibleDialogProgress: boolean = false;
  isSpinnerVisible = false;
  hasPendingChanges: boolean = false;

  useIaAttach: boolean = false;

  //MANEJO DE TOKEN URL
  token: string | null = null;
  requestData: any = null;
  pendingRequest!: PendingRequest;
  mostrarPopup: boolean = false;

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');

    console.log('TOKEN OBTENIDO', this.token);

    if (this.token) {
      this.validateToken(this.token);
    } else {
      this.mostrarPopup = true;
      console.error('Token no encontrado en la URL');
      //this.router.navigate(['/']);
    }

    //let applicant = localStorage.getItem('applicant-type');
    //let request = localStorage.getItem('request-type');
    //const visitedFirstPage = localStorage.getItem('visitedFirstPage');

    //console.log(visitedFirstPage);

    /*
    if (!visitedFirstPage) {
      this.router.navigate([RoutesApp.CREATE_REQUEST]);
    } else {
      //let applicant = localStorage.getItem('applicant-type');
      if (applicant) {
        this.applicantType = JSON.parse(applicant);
      }
      //let request = localStorage.getItem('request-type');
      if (request) {
        this.requestType = JSON.parse(request);
      }
      this.getApplicantList();
      this.requestForm.get('number_id')?.disable();
    } */
  }

  constructor(
    private formBuilder: FormBuilder,
    private userService: Users,
    private messageService: MessageService,
    private router: Router,
    private http: HttpClient,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute
    //private pendingRequestService: PendingRequestService
  ) {
    this.value = {
      catalog_item_id: 1,
      catalog_item_name: 'NIT',
      regex: '^[0-9]{0,9}$',
    };
    this.requestForm = this.formBuilder.group({
      mensage: ['', [Validators.required, Validators.maxLength(1000)]],
    });

    this.requestForm.get('document_type')?.valueChanges.subscribe(value => {
      this.requestForm.get('number_id')?.setValidators([Validators.pattern(value.regex)]);
      this.requestForm.get('number_id')?.enable();
      if (value.catalog_item_id == 0) {
        this.errorMensaje = 'Ingrese solo números ';
      } else if (value.catalog_item_id == 15) {
        this.errorMensaje = 'Ingrese solo números y máximo 12 digitos';
      } else if (value.catalog_item_id == 16) {
        this.errorMensaje = 'Formato inválido';
      } else if (value.catalog_item_id == 1) {
        this.errorMensaje = 'Ingrese solo números y máximo 11 digitos';
      }
    });
  }

  validateToken(token: string) {
    const payload: Token = {
      token: token,
    };

    console.log('PAYLOAD: ', payload);
    this.userService.getRequestPendingByToken(payload).subscribe({
      next: (response): void => {
        console.log(response);
        if (response.code === 200) {
          this.pendingRequest = response.data;
          console.log('DATOS PENDING', this.pendingRequest);
        } else {
          this.mostrarPopup = true; // Mostrar pop-up si el token no es válido
          //this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
          console.error('Token inválido o expirado');
          //this.router.navigate(['/']);
        }
      },
      error: (err: any) => {
        this.mostrarPopup = true; // Mostrar pop-up si hay un error
        console.error('Error al validar token:', err);
        this.router.navigate(['/']);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
      },
    });
  }

  cerrarPopup(): void {
    this.mostrarPopup = false; // Cerrar el pop-up
    this.router.navigate(['/']); // Redirigir al usuario
  }

  convertToLowercase(controlName: string): void {
    const control = this.requestForm.get(controlName);
    if (control) {
      control.setValue(control.value.toLowerCase(), { emitEvent: false });
    }
  }

  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }
  emailMatcher: ValidatorFn = (formControl: AbstractControl) => {
    const email = formControl.get('email')?.value;
    const emailConfirmed = formControl.get('validator_email')?.value;
    return email === emailConfirmed ? null : { notMatched: true };
  };

  openFileInput() {
    this.fileInput.nativeElement.value = ''; // Limpiar la entrada de archivos antes de abrir el cuadro de diálogo
    this.fileInput.nativeElement.click();
  }
  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (this.arrayApplicantAttachment.length === 0) {
      this.fileNameList.clear();
    }

    for (let i = 0; i < files.length; i++) {
      const file: File = files[i];

      let fileSizeFormat: string;
      const fileName: string = file.name;
      const fileSizeInKiloBytes = file.size / 1024;
      if (fileSizeInKiloBytes < 1024) {
        fileSizeFormat = fileSizeInKiloBytes.toFixed(2) + 'KB';
      } else {
        const fileSizeMegabytes = fileSizeInKiloBytes / 1024;
        fileSizeFormat = fileSizeMegabytes.toFixed(2) + 'MB';
      }

      if (this.isValidExtension(file)) {
        this.errorMensajeFile = `El archivo ${files[i].name} tiene una extension no permitida`;
        this.errorExtensionFile = true;
        continue;
      }

      if (file.size > 30720000) {
        this.errorMensajeFile = `El archivo ${files[i].name} supera los 30MB`;
        this.errorSizeFile = true;
        continue;
      }

      const exists = this.arrayApplicantAttachment.some(item => item.source_name === fileName);
      if (exists) {
        this.errorMensajeFile = `El archivo ${fileName} ya está adjunto`;
        this.errorRepeatFile = true;
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String: string = e.target.result.split(',')[1];
        const applicantAttach: ApplicantAttachments = {
          base64file: base64String,
          source_name: fileName,
          fileweight: fileSizeFormat,
          file: files[i],
        };

        this.fileNameList.add(fileName);
        this.arrayApplicantAttachment.push(applicantAttach);
      };
      reader.readAsDataURL(file);
    }
    console.log(this.arrayApplicantAttachment, 'seleccionados');
    setTimeout(() => {
      this.errorRepeatFile = false;
      this.errorExtensionFile = false;
      this.errorSizeFile = false;
    }, 5000);
  }

  getAplicant(): ApplicantAttachments[] {
    return this.arrayApplicantAttachment;
  }

  clearFileInput(index: number) {
    const removedFile = this.arrayApplicantAttachment.splice(index, 1)[0];
    this.fileNameList.delete(removedFile.source_name);
  }

  isValidExtension(file: File): boolean {
    const extensionesValidas = ['.jpeg', '.jpg', '.png', '.pdf', '.doc', '.xlsx', '.docx', '.xls'];
    const fileExtension = file?.name?.split('.').pop()?.toLowerCase();
    return !extensionesValidas.includes('.' + fileExtension);
  }

  getApplicantList() {
    this.userService.getFormById(this.requestType.form_id || 0).subscribe({
      next: (response: BodyResponse<any[]>): void => {
        if (response.code === 200) {
          this.documentList = response.data[0].catalog_source;
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

  async setParameter(inputValue: RequestFormListPending) {
    inputValue.count_attacments = this.getAplicant().length;

    // Si no hay adjuntos
    if (inputValue.count_attacments === 0) {
      const mensaje = inputValue.request_description;

      // Validar si es necesario adjuntar archivo
      const necesitaAdjuntar = await this.validarMensaje(mensaje);

      if (necesitaAdjuntar) {
        const usuarioAcepta = await this.showAdjuntarArchivoModal(); // Mostrar modal

        if (!usuarioAcepta) {
          // Si el usuario cancela, salir
          return;
        }
      }
    }

    // Continuar con la creación de la solicitud
    this.continuarCreacionSolicitud(inputValue);
  }

  continuarCreacionSolicitud(inputValue: RequestFormListPending) {
    //this.userService.createRequest(inputValue).subscribe({
    this.userService.answerRequestPending(inputValue).subscribe({
      next: (response: BodyResponse<number>) => {
        if (response.code === 200) {
          //this.requestForm.reset();
          //this.fileNameList.clear();
          if (this.getAplicant().length == 0) {
            setTimeout(() => {
              this.showAlertModal(response.data);
            }, 1000);
          } else {
            console.log('ENTRO PARA SUBIR ARCHIVOS');
            this.attachApplicantFiles(response.data);
          }

          // Actualiza el registro cuando la operación sea exitosa
          this.actualizarLogProceso(response.data);
        } else {
          setTimeout(() => {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
          }, 1000);
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada post.');
      },
    });
  }

  actualizarLogProceso(request_id: number) {
    const transactionId = localStorage.getItem('id-transaction');

    if (!transactionId) {
      console.error('No se encontró un ID de transacción para actualizar el registro.');
      return;
    }

    const payload: ProcessRequest = {
      operation: 'update',
      transaction_id: transactionId,
      status: 'Finalizado',
      request_id: request_id,
      validation_attachemens: this.useIaAttach,
    };

    console.log(payload);

    this.userService.registerProcessRequest(payload).subscribe({
      next: (response: BodyResponse<string>) => {
        if (response.code === 200) {
          localStorage.removeItem('id-transaction');
          console.log('Actualizacion exitoso en log de proceso de solicitud');
          console.log('ID de transacción eliminado del LocalStorage.');
        } else {
          console.log('Error actualizando en log de proceso de solicitud');
        }
      },
      error: err => {
        console.error('Error consumiendo el servicio de registro request:', err);
      },
    });
  }

  showAdjuntarArchivoModal(): Promise<boolean> {
    return new Promise(resolve => {
      this.modalTitle = 'Adjuntar archivo';
      this.modalMessage = '¿Desea enviar su solicitud sin documentos o archivos adjuntos?';
      this.showModal = true; // Muestra el modal
      this.useIaAttach = true;

      // Asignar funciones para aceptar o cancelar
      this.onAccept = () => {
        this.showModal = false; // Oculta el modal
        resolve(true); // Resuelve la promesa, continúa el proceso
      };

      this.onCancel = () => {
        this.showModal = false; // Oculta el modal
        resolve(false); // Resuelve la promesa, pero el proceso no sigue
      };
    });
  }

  // Cuando el usuario acepta
  onAccept() {
    this.showModal = false; // Oculta el modal
    this.resolveModal(); // Resuelve la promesa
  }

  // Cuando el usuario cancela
  onCancel() {
    this.showModal = false; // Oculta el modal
    this.resolveModal(); // Resuelve la promesa, pero no continúa el proceso
  }

  /*
  async getPreSignedUrl(file: ApplicantAttachments, request_id: number): Promise<string | void> {
    console.log('ESCRIBIR EN BD ARCHIVOS');
    this.isSpinnerVisible = true;
    const payload = {
      // Ajuste para eliminar lo puntos o caracteres especiales en los nombres de los adjuntos
      source_name: file['source_name'].replace(/(?!\.[^.]+$)\./g, '_'),
      fileweight: file['fileweight'],
      request_id: request_id,
    };

    return new Promise((resolve, reject) => {
      console.log('CARGANDO A S3');
      this.userService.getUrlSigned(payload, 'pending_ext').subscribe({
        next: (response: BodyResponse<string>): void => {
          if (response.code === 200) {
            this.preSignedUrl = response.data;
            resolve(this.preSignedUrl); // Resuelve la Promise
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
            reject(new Error('Operación fallida!')); // Rechaza la Promise
          }
        },
        error: (err: any) => {
          console.log(err);
          reject(err); // Rechaza la Promise en caso de error
        },
        complete: () => {
          console.log('La solicitud para obtener la URL prefirmada ha sido completada.');
          //this.uploadToPresignedUrl(file);
        },
      });
    });
  } */

  //MEJORA 2025
  async getPreSignedUrl(file: ApplicantAttachments, request_id: number): Promise<string> {
    this.isSpinnerVisible = true;

    const payload = {
        source_name: file.source_name.replace(/(?!\.[^.]+$)\./g, '_'), // Evitar caracteres conflictivos
        fileweight: file.fileweight,
        request_id: request_id,
        content_type: file.file?.type || 'application/octet-stream'
    };

    const MAX_RETRIES = 3;
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
      try {
          const response = await firstValueFrom(this.userService.getUrlSigned(payload, 'pending_ext'));

          if (response.code === 200 && response.data) {
            return response.data; // Retornar la URL sin asignarla a this.preSignedUrl
          } else {
              console.error(`Intento ${attempts + 1}: Error al obtener URL prefirmada`, response);
          }
        } catch (error) {
            console.error(`Intento ${attempts + 1}: Falló la solicitud para obtener la URL prefirmada`, error);
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2s antes de reintentar
    }

    throw new Error('No se pudo obtener la URL prefirmada después de múltiples intentos');
  }

  /*
  async uploadToPresignedUrl(file: ApplicantAttachments) {
    const uploadResponse = await this.http
      .put(this.preSignedUrl, file.file, {
        headers: {
          'Content-Type': 'application/png',
        },
        reportProgress: true,
        observe: 'events',
      })
      .toPromise();
  } */

  /*    
  async uploadToPresignedUrl(file: ApplicantAttachments, request_id: number): Promise<void> {
    this.isSpinnerVisible = true;
    if (file && file.file) {
      try {
        const contentType = 'application/png';
        const MAX_RETRIES = 3;
        const RETRY_DELAY_MS = 2000;

        console.log('Archivos: ', file.file);
        console.log('PreSignerUrl', this.preSignedUrl);

        //this.preSignedUrl += 'invalid-part'; // Invalidar URL

        const upload$ = this.http
          .put(this.preSignedUrl, file.file, {
            headers: { 'Content-Type': contentType },
            reportProgress: true,
            observe: 'events',
          })
          .pipe(
            retryWhen(errors =>
              errors.pipe(
                tap((error: HttpErrorResponse) => {
                  // Extrae información detallada del error
                  const errorDetails = {
                    status: error.status,
                    statusText: error.statusText,
                    message: error.message,
                    url: error.url,
                  };
                  //console.error('Intento fallido de subida:', errorDetails);
                  // Guarda el intento fallido con detalles del error
                  this.handleUploadFailure(file, request_id, errorDetails);
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

        const uploadResponse = await upload$.toPromise();

        if (uploadResponse) {
          if (uploadResponse.type === HttpEventType.UploadProgress) {
            const progress = Math.round(
              (uploadResponse.loaded / (uploadResponse.total || 1)) * 100
            );
            //console.log(`Progreso de la subida: ${progress}%`);
          } else if (uploadResponse instanceof HttpResponse) {
            //console.log('Archivo subido con éxito:', uploadResponse.body);
          }
        }
      } catch (error) {
        console.error('Falló la subida del archivo. Error:', error);
      } finally {
        this.isSpinnerVisible = false;
      }
    } else {
      console.error('El archivo no es válido o está undefined.');
    }
  } */

  //MEJORA 2025
  async uploadToPresignedUrl(file: ApplicantAttachments, request_id: number): Promise<void> {
    this.isSpinnerVisible = true;

    if (!file || !file.file) {
        console.error('El archivo no es válido o está undefined.');
        return;
    }

    if (!file.preSignedUrl) {
        console.error(`No se encontró una URL prefirmada para el archivo: ${file.source_name}`);
        return;
    }

    try {
        const contentType = file.file?.type || 'application/octet-stream'; // Detectar MIME type
        console.log("CONTENT-TYPE", contentType);
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

                            // Solo reintentar en errores temporales
                            if (![500, 502, 503, 504, 429].includes(error.status)) {
                                throw error; // Detener reintentos en errores definitivos
                            }

                            this.handleUploadFailure(file, request_id, errorDetails);
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
    } finally {
        this.isSpinnerVisible = false;
    }
  }

  // ENVIO AL SERVICIO QUE VA A GUARDAR EN LA TABLA DE LOGS
  handleUploadFailure(file: ApplicantAttachments, request_id: number, errorDetails: any) {
    //console.log('Registrando intento de fallo en base de datos.');

    const payload: ErrorAttachLog = {
      request_id: request_id,
      status: 'REPORTADO',
      name_archive: file.source_name,
      error_message:
        `Status: ${errorDetails.status}, ` +
        `StatusText: ${errorDetails.statusText}, ` +
        `Message: ${errorDetails.message}, ` +
        `URL: ${errorDetails.url || 'unknown'}`,
      error_type: 'S3',
    };

    this.userService.registerErrorAttach(payload).subscribe({
      next: response => {
        if (response && response.code === 200) {
          console.log('Error registrado correctamente en la base de datos.');
        } else {
          console.error(
            'No se pudo registrar el error. Código de respuesta no esperado:',
            response?.code
          );
        }
      },
      error: err => {
        console.error('Error al intentar registrar el log en la base de datos:', err);
      },
      complete: () => {
        console.log('Proceso de registro de error en base de datos completado.');
      },
    });
  }

  /*
  async attachApplicantFiles(request_id: number) {
    // Establecer el estado de carga antes de comenzar
    this.isSpinnerVisible = true;
    this.hasPendingChanges = true;

    try {
      if (this.arrayApplicantAttachment && this.arrayApplicantAttachment.length > 0) {
        const ruta_archivo_ws = environment.ruta_archivos_ws;

        const estructura = {
          //idSolicitud: `${request_id}`,
          idSolicitud: this.pendingRequest.request_id,
          archivos: this.arrayApplicantAttachment.map(file => ({
            base64file: file.base64file,
            source_name: file.source_name,
            fileweight: file.fileweight,
          })),
        };
        // Llamar a la función para enviar archivos al servidor
        await this.envioArchivosServer(ruta_archivo_ws, estructura);
      }

      // Obtener todas las URL prefirmadas y subir los archivos
      await Promise.all(
        this.arrayApplicantAttachment.map(async item => {
          await this.getPreSignedUrl(item, request_id); // Await
          await this.uploadToPresignedUrl(item, request_id); // Sube el archivo después de obtener la URL
        })
      );

      this.requestForm.reset();
      this.fileNameList.clear();

      //console.log('Ejecucion completa!!!');

      this.showAlertModal(request_id); // Muestra el modal después de que todo haya terminado
    } catch (error) {
      console.error('Error durante el proceso de carga:', error);
      this.showAlertModalError(request_id);
    } finally {
      this.isSpinnerVisible = false; // Oculta el spinner al final
      this.hasPendingChanges = false;
    }
  } */

  //MEJORA 2025 SUBIDA
  /*
async attachApplicantFiles(request_id: number) {
  this.isSpinnerVisible = true;
  this.hasPendingChanges = true;
  this.uploadProgress = 0;

  try {
      if (!this.arrayApplicantAttachment || this.arrayApplicantAttachment.length === 0) {
          console.warn('No hay archivos para subir.');
          return;
      }

      const ruta_archivo_ws = environment.ruta_archivos_ws;
      const totalFiles = this.arrayApplicantAttachment.length;
      let uploadedFiles = 0;

      // Paso 1: Enviar archivos al servidor (base de datos)
      const estructura = {
          idSolicitud: `${request_id}`,
          archivos: this.arrayApplicantAttachment.map(file => ({
              base64file: file.base64file,
              source_name: file.source_name,
              fileweight: file.fileweight,
          })),
      };

      try {
        await this.envioArchivosServer(ruta_archivo_ws, estructura);
      } catch (error) {
        console.error("Error al enviar archivos:", error);
        // Aquí puedes mostrar un mensaje de error en la UI
      }

      //await this.envioArchivosServer(ruta_archivo_ws, estructura);

      // Paso 2: Obtener URL prefirmadas y subir archivos
      for (const item of this.arrayApplicantAttachment) {
          try {
              // Obtener URL prefirmada con reintentos
              const preSignedUrl = await this.retry(
                  () => this.getPreSignedUrl(item, request_id),
                  1, // Intentos
                  2000 // Retraso entre intentos
              );

              if (!preSignedUrl) {
                  console.error(`No se pudo obtener la URL prefirmada para: ${item.source_name}`);
                  continue; // No seguir con la subida si no hay URL
              }

              // Asignar la URL al archivo
              item.preSignedUrl = preSignedUrl;

              // Subir el archivo con reintentos
              await this.retry(
                  () => this.uploadToPresignedUrl(item, request_id), //Aquí se pasa la URL
                  3, // Intentos
                  3000 // Retraso entre intentos
              );

              uploadedFiles++;
              this.uploadProgress = Math.round((uploadedFiles / totalFiles) * 100);
              this.changeDetectorRef.detectChanges();

          } catch (error) {
              console.error(`Error al procesar el archivo ${item.source_name}:`, error);
          }
      }

      this.uploadProgress = 100;
      this.changeDetectorRef.detectChanges();

      // Restablecer formulario y mostrar mensaje de éxito
      this.requestForm.reset();
      this.fileNameList.clear();
      this.showAlertModal(request_id);

  } catch (error) {
      console.error('Error durante el proceso de carga:', error);
      this.showAlertModalError(request_id);
  } finally {
      setTimeout(() => {
          this.isSpinnerVisible = false;
          this.hasPendingChanges = false;
          this.uploadProgress = 0;
      }, 500);
  }
} */

async attachApplicantFiles(request_id: number) {
  this.isSpinnerVisible = true;
  this.hasPendingChanges = true;
  this.uploadProgress = 0;

  try {
    if (!this.arrayApplicantAttachment || this.arrayApplicantAttachment.length === 0) {
        console.warn('No hay archivos para subir.');
        return;
    }

    const ruta_archivo_ws = environment.ruta_archivos_ws;
    const totalFiles = this.arrayApplicantAttachment.length;
    let uploadedFiles = 0;

    // Paso 1: Enviar archivos al servidor (base de datos)
    const estructura = {
        idSolicitud: `${request_id}`,
        archivos: this.arrayApplicantAttachment.map(file => ({
            base64file: file.base64file,
            source_name: file.source_name,
            fileweight: file.fileweight,
        })),
    };

    try {
        await this.envioArchivosServer(ruta_archivo_ws, estructura);
    } catch (error) {
        console.error("Error al enviar archivos:", error);
    }

    // Paso 2: Subir archivos por ambos métodos (URL prefirmada y SDK vía Lambda)
    for (const item of this.arrayApplicantAttachment) {
        try {
            // Obtener URL prefirmada
            const preSignedUrl = await this.retry(
                () => this.getPreSignedUrl(item, request_id),
                1, // Intentos
                2000 // Retraso entre intentos
            );

            if (!preSignedUrl) {
                console.error(`No se pudo obtener la URL prefirmada para: ${item.source_name}`);
                continue;
            }

            // Asignar la URL al archivo
            item.preSignedUrl = preSignedUrl;

            // Subir en paralelo a S3 (preSignedUrl) y al backend (Lambda con SDK)
            await Promise.all([
                this.retry(() => this.uploadToPresignedUrl(item, request_id), 3, 3000),
                this.retry(() => this.uploadViaLambda(item, request_id), 3, 3000)
            ]);

            uploadedFiles++;
            this.uploadProgress = Math.round((uploadedFiles / totalFiles) * 100);
            this.changeDetectorRef.detectChanges();

        } catch (error) {
            console.error(`Error al procesar el archivo ${item.source_name}:`, error);
        }
      }

      this.uploadProgress = 100;
      this.changeDetectorRef.detectChanges();

      // Restablecer formulario y mostrar mensaje de éxito
      this.requestForm.reset();
      this.fileNameList.clear();
      this.showAlertModal(request_id);

  } catch (error) {
      console.error('Error durante el proceso de carga:', error);
      this.showAlertModalError(request_id);
  } finally {
      setTimeout(() => {
          this.isSpinnerVisible = false;
          this.hasPendingChanges = false;
          this.uploadProgress = 0;
      }, 500);
  }
}

async uploadViaLambda(file: any, request_id: number) {
  try {
      const payload = {
          file: file.base64file, // Archivo en Base64
          filename: file.source_name,
          source_name: file.source_name,
          request_id: request_id
      };

      // Llamado a la API de la Lambda a través de userService
      const response = await this.userService.uploadPostSdk(payload).toPromise();
      console.log('Subida a S3 vía SDK exitosa:', response);

  } catch (error) {
      console.error('Error subiendo archivo vía Lambda:', error);
      throw error;
  }
}

async retry<T>(operation: () => Promise<T>, retries: number, delayMs: number): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
      try {
          return await operation();
      } catch (error) {
          attempt++;
          console.warn(`Intento ${attempt} fallido. Reintentando en ${delayMs}ms...`);
          if (attempt === retries) throw error;
          await new Promise(res => setTimeout(res, delayMs));
      }
  }
  throw new Error('Todos los intentos fallaron');
}

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    // Si hay un proceso pendiente, se muestra la advertencia
    if (this.hasPendingChanges) {
      $event.returnValue = 'Tienes un proceso en curso. ¿Estás seguro de que quieres salir?';
    }
  }

  //ENVIO DE ARCHIVOS AL SERVIDOR DE CONFA
  /*
  async envioArchivosServer(ruta_archivo_ws: any, estructura: any) {
    this.isSpinnerVisible = true;
    try {
      // Usa await para que se pause hasta que se reciba la respuesta
      const respuesta = await this.http.post(ruta_archivo_ws, estructura).toPromise();
      //console.log('Respuesta del servicio:', respuesta);
    } catch (error) {
      console.error('Error al llamar al servicio:', error);
    }
  } */

  async envioArchivosServer(ruta_archivo_ws: string, estructura: any) {
    try {
        const archivos = estructura.archivos;
        const totalArchivos = archivos.length;

        for (let i = 0; i < totalArchivos; i++) {
            const archivo = archivos[i];

            // Subir cada archivo de manera individual
            await this.http.post(ruta_archivo_ws, { ...estructura, archivos: [archivo] }).toPromise();

            this.uploadProgress = Math.round(((i + 1) / totalArchivos) * 50);
            this.changeDetectorRef.detectChanges(); // Forzar actualización de la UI
        }
    } catch (error) {
        console.error('Error al subir archivos:', error);
    }
  }

  /*
  sendRequest() {
    const payload: RequestFormListPending = {
      request_status: 1,
      applicant_type: this.applicantType.applicant_type_id,
      request_type: this.requestType.request_type_id,
      doc_type: this.requestForm.controls['document_type'].value['catalog_item_id'],
      doc_id: this.requestForm.controls['number_id'].value,
      applicant_name: this.requestForm.controls['name'].value,
      applicant_email: this.requestForm.controls['email'].value,
      applicant_cellphone: this.requestForm.controls['cellphone'].value,
      request_description: this.requestForm.controls['mensage'].value,
      request_days: this.requestType.request_days || 15,
      assigned_user: '',
      request_answer: '',
      data_treatment: true,
      applicant_attachments: null,
      assigned_attachments: null,
      form_id: this.requestType.form_id,
      count_attacments: 0,
    };

    this.setParameter(payload);
  } */

  sendRequest() {
    const payload: RequestFormListPending = {
      token_url: this.token,
      request_id: this.pendingRequest.request_id,
      request_status: 2,
      request_description: this.requestForm.controls['mensage'].value,
      applicant_attachments: null,
      assigned_attachments: null,
      count_attacments: 0,
    };

    this.setParameter(payload);
  }

  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAction = value;
    this.router.navigate([RoutesApp.CREATE_REQUEST]);
    //localStorage.removeItem('visitedFirstPage');
  }
  showAlertModal(filing_number: number) {
    this.visibleDialogAlert = true;
    this.informative = true;
    //this.isError = false;
    this.tittle_message = '¡Solicitud enviada con éxito!';
    this.message = filing_number.toString();
    this.severity = 'danger';
  }

  validarRespuesta(): boolean {
    return true;
  }

  validarMensaje(mensaje: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.userService.respuestaIaAdjuntos(mensaje).subscribe(
        response => {
          if (response.statusCode === 200) {
            const responseBody = response.respuesta;
            const mensajeNormalizado = responseBody
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '');

            const contieneSi = mensajeNormalizado.includes('si');
            resolve(contieneSi); // Resolves la promesa con true o false
          } else {
            resolve(false);
            // reject('Error en la respuesta del servicio');
          }
        },
        error => {
          resolve(false);
          console.error('Error en la solicitud:', error);
        }
      );
    });
  }
  showAlertModalError(filing_number: number) {
    this.visibleDialogAlert = true;
    this.informative = true;
    this.isError = true;
    //this.tittle_message = '¡Solicitud enviada! <br> <span class="warning-message"> Sin embargo, hubo problemas con algunos de los archivos.</span>';
    this.tittle_message =
      '¡Solicitud enviada! <br> <h3 style="color: #ffc107 !important; font-size: 1.2rem;">Sin embargo, hubo problemas con algunos de los archivos.</h3>';
    this.message = filing_number.toString();
    this.severity = 'danger';
  }

  //Configuracion mensajes placeholder
  /*
  getPlaceholder(): string {
    switch(this.applicantType.applicant_type_id) {
      case 1:
        return '*Descripción detallada de la solicitud';
      default:
        return '*Descripción detallada de la solicitud incluyendo los datos de las personas a cargo';
    }
  } */
}
