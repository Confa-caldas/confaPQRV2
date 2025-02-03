import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { Users } from '../../../services/users.service';
import {
  ApplicantAttach,
  ApplicantAttachments,
  CharacterizationCreate,
  RequestHistoric,
  RequestsDetails,
  RequestsList,
  answerRequest,
  Pagination,
  RequestAttachmentsList,
  MiPerfilConfa,
  Afiliado,
  RequestAnswerTemp,
  PendingRequest,
  sendEmail,
  requestHistoryRequest,
  historyRequest,
} from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoutesApp } from '../../../enums/routes.enum';
import { SessionStorageItems } from '../../../enums/session-storage-items.enum';
import { HttpClient } from '@angular/common/http';
import { PaginatorState } from 'primeng/paginator';
import { v4 as uuidv4 } from 'uuid';
//Esto es nuevo
import { Observable } from 'rxjs';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { Timeline } from 'primeng/timeline';
// import { Util } from '../../../utils/utils';
// import * as pdfMake from 'pdfmake/build/pdfmake';
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-request-details',
  templateUrl: './request-details.component.html',
  styleUrl: './request-details.component.scss',
})
export class RequestDetailsComponent implements OnInit {
  @ViewChild('archive_request') fileInput!: ElementRef;

  @ViewChild('archive_request_pending') fileInputPending!: ElementRef;

  displayPreviewModal: boolean = false;
  viewerType: 'google' | 'office' | 'image' | 'pdf' = 'google';

  requestList: RequestsList[] = [];
  requestDetails?: RequestsDetails;
  requestHistoric: RequestHistoric[] = [];
  requestHistoricAttach: RequestHistoric[] = [];
  ingredient!: string;
  visibleDialog = false;
  visibleDialogInput = false;
  visibleDialogAlert = false;
  visibleCharacterization = false;
  message = '';
  message2 = '';
  buttonmsg = '';
  parameter = [''];
  request_details!: RequestsDetails;
  selectedRequests: RequestsList[] = [];
  request_id: number = 0;
  tabWidth!: number;
  ApplicantAttach: ApplicantAttach[] = [];
  AssignedAttach: ApplicantAttach[] = [];
  informative: boolean = false;
  severity = '';
  errorExtensionFile!: boolean;
  errorSizeFile!: boolean;
  fileNameList: string[] = [];
  fileNameListPending: string[] = [];
  arrayAssignedAttachment: ApplicantAttachments[] = [];
  arrayAssignedAttachmentPending: ApplicantAttachments[] = [];
  routeProcessRequest!: string;
  routeSearchRequest!: string;
  // routeTab!: string;
  routeTab: string = ''; // Inicializar con un valor por defecto
  requestProcess: FormGroup;
  enableAssign: boolean = false;
  user!: string;
  PERFIL!: string;
  base64File: string = '';
  requestAssignedAttachmentsList: RequestAttachmentsList[] = [];
  requestApplicantAttachmentsList: RequestAttachmentsList[] = [];
  errorMensajeFile!: string;
  errorRepeatFile!: boolean;

  firstHistoric: number = 0;
  pageHistoric: number = 1;
  rowsHistoric: number = 10;
  totalRowsHistoric: number = 0;

  firstAssignedAttachments: number = 0;
  pageAssignedAttachments: number = 1;
  rowsAssignedAttachments: number = 10;
  totalRowsAssignedAttachments: number = 0;

  firstApplicantAttachments: number = 0;
  pageApplicantAttachments: number = 1;
  rowsApplicantAttachments: number = 10;
  totalRowsApplicantAttachments: number = 0;
  preSignedUrl: string = '';
  preSignedUrlDownload: string = '';
  selectedFile: File | null = null;
  visibleDialogdDescrip = false;
  visibleDialogdDescripRadicada = false;
  isDialogVisible: boolean = false;
  dialogHeader: string = '';
  dialogContent: string = '';
  isSpinnerVisible = false;

  dataLoaded: any; // Aquí está el dato previamente cargado
  responseData: any;
  visibleDialogIa = false;
  visibleCorreccionIa = false;
  visibleCorreccionIaEnviar = false;
  visibleSolicitudPendiente = false;
  visibleHistory = false;
  categoria: string = '';
  respuestaPredefinida: string = '';
  respuestaCorregida: string = '';
  respuestaSolicitud: string = '';
  palabrasError: string = '';
  errores: boolean = false;
  //Esto es nuevo
  documentValue: string = ''; // Valor del documento (cédula)
  valor: string = ''; // Otro valor que quieras pasar en la URL
  nombreAfiliado: string = '';
  userMiPerfil!: MiPerfilConfa;
  imgPdf2: string = '';
  // fechaEntrega: string = this.formatDate(new Date());
  afiliado?: Afiliado;
  imgPdf1: string = '';

  //variables para respuestas temporal
  respuestaTemp: string = '';
  existEraserAsnwer: boolean = false;

  //utilitarios
  items: MenuModule[] | undefined;
  pendingRequestForm: FormGroup;
  selectedFilesPending: File[] = [];
  visibleSolicitudEnvioMasivo = false;
  envioMasivoForm: FormGroup;
  emailInput: string = ''; // Variable para capturar el correo ingresado
  emailList: string[] = []; // Lista de correos agregados
  errorMessage: string = '';
  currentState: string = '';
  currentIndex: number = 0;

  // Arreglo de eventos para la línea de tiempo
  events: any[] = [];

  historyData: Array<any> = [];
  // historyData!: historyRequest[];
  // history!: historyRequest;
  // requestPendingAttachmentsList: RequestAttachmentsList[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private userService: Users,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    // (window as any).pdfMake.vfs = pdfFonts.pdfMake.vfs;
    this.requestProcess = this.formBuilder.group({
      mensage: [null, [Validators.required, Validators.maxLength(6000)]],
      //mensage: [null, [Validators.required]],
    });

    this.pendingRequestForm = this.fb.group({
      message: ['', [Validators.required, Validators.maxLength(6000)]],
      //file: [null, Validators.required],
    });

    this.envioMasivoForm = this.fb.group({
      message: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    this.PERFIL = sessionStorage.getItem(SessionStorageItems.PERFIL) || '';
    this.user = sessionStorage.getItem(SessionStorageItems.USER) || '';

    // console.log(localStorage.getItem);
    let routeIf = localStorage.getItem('route');
    if (routeIf?.includes(RoutesApp.SEARCH_REQUEST)) {
      this.routeTab = routeIf;
    } else if (routeIf?.includes(RoutesApp.PROCESS_REQUEST)) {
      this.routeTab = routeIf;
    }

    this.route.params.subscribe(params => {
      this.request_id = +params['id'];
    });
    this.getRequestDetails(this.request_id);
    this.initPaginadorHistoric();
    this.getRequestApplicantAttachments(this.request_id);
    this.getRequestAssignedAttachments(this.request_id);

    //validar si esta cerrada
    this.getAnswerTemp(this.request_id);
    // histico sobre reapertura de solicitudes
    this.getHistoryRequest(this.request_id);

    // //Neuvo pdf
    // Util.getImageDataUrl('assets/imagenes/encabezado.png').then(
    //   imagenConfa => (this.imgPdf2 = imagenConfa)
    // );

    // Util.getImageDataUrl('assets/imagenes/footer.png').then(
    //   imagenConfaFooter => (this.imgPdf1 = imagenConfaFooter)
    // );

    this.items = [
      {
        items: [
          {
            label: 'Reabrir solicitud',
            icon: 'pi pi-history',
            command: () => this.solicitudPendiente(),
          },
          {
            label: 'Envio de respuesta',
            icon: 'pi pi-send',
            command: () => this.envioCorreoMasivo(),
          },
        ],
      },
    ];
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

  onPageChangeAssignedAttachments(eventAssignedAttachments: PaginatorState) {
    this.firstAssignedAttachments = eventAssignedAttachments.first || 0;
    this.rowsAssignedAttachments = eventAssignedAttachments.rows || 0;
    this.pageAssignedAttachments = Number(eventAssignedAttachments.page) + 1 || 0;
    this.getRequestAssignedAttachments(this.request_id);
  }
  cleanFormAssignedAttachments() {
    this.firstAssignedAttachments = 0;
    this.pageAssignedAttachments = 1;
    this.rowsAssignedAttachments = 10;
    this.requestAssignedAttachmentsList = [];
    this.getRequestAssignedAttachments(this.request_id);
  }

  initPaginadorAssignedAttachments() {
    this.firstAssignedAttachments = 0;
    this.pageAssignedAttachments = 1;
    this.rowsAssignedAttachments = 10;
    this.getRequestAssignedAttachments(this.request_id);
  }

  onPageChangeApplicantAttachments(eventApplicantAttachments: PaginatorState) {
    this.firstApplicantAttachments = eventApplicantAttachments.first || 0;
    this.rowsApplicantAttachments = eventApplicantAttachments.rows || 0;
    this.pageApplicantAttachments = Number(eventApplicantAttachments.page) + 1 || 0;
    this.getRequestApplicantAttachments(this.request_id);
  }
  cleanFormApplicantAttachments() {
    this.firstApplicantAttachments = 0;
    this.pageApplicantAttachments = 1;
    this.rowsApplicantAttachments = 10;
    this.requestApplicantAttachmentsList = [];
    this.getRequestApplicantAttachments(this.request_id);
  }

  initPaginadorApplicantAttachmentss() {
    this.firstApplicantAttachments = 0;
    this.pageApplicantAttachments = 1;
    this.rowsApplicantAttachments = 10;
    this.getRequestApplicantAttachments(this.request_id);
  }

  showSuccessMessage(state: string, title: string, message: string) {
    this.messageService.add({ severity: state, summary: title, detail: message });
  }

  showProcessTab(): boolean {
    if (
      // (this.routeTab.includes(RoutesApp.PROCESS_REQUEST) ||
      //   this.routeTab.includes(RoutesApp.REQUEST_DETAILS)) &&
      this.user === this.requestDetails?.assigned_user &&
      this.requestDetails.status_name != 'Cerrada'
    ) {
      return true;
    } else {
      return false;
    }
  }

  getRequestDetails(request_id: number) {
    this.userService.getRequestDetails(request_id).subscribe({
      next: (response: BodyResponse<RequestsDetails>) => {
        if (response.code === 200) {
          this.requestDetails = response.data;

          // Lista de estados que se deben agrupar
          const estadosAgrupados = [
            'Asignada',
            'Reasignada',
            'Asignada - En revisión',
            'Reasignada - En revisión',
            'Pendiente Usuario Externo',
          ];

          // Agrupar estados en "Gestión"
          this.currentState = estadosAgrupados.includes(this.requestDetails.status_name)
            ? 'Gestión'
            : this.requestDetails.status_name;
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

  getRequestApplicantAttachments(request_id: number) {
    const payload: Pagination = {
      request_id: request_id,
      page: this.pageApplicantAttachments,
      page_size: this.rowsApplicantAttachments,
    };
    this.userService.getRequestAttachments(payload, 'applicant').subscribe({
      next: (response: BodyResponse<RequestAttachmentsList[]>) => {
        if (response.code === 200) {
          this.requestApplicantAttachmentsList = response.data;
          this.totalRowsApplicantAttachments = Number(response.message);
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

  extractFileSize(fileSize: string): number {
    const sizeParts = fileSize.split(' ');
    const numericSize = parseFloat(sizeParts[0]);
    const unit = sizeParts[1];

    if (unit === 'MB') {
      return numericSize;
    } else {
      return numericSize;
    }
  }

  handleBtn(fileSize: string, fileExt: string): boolean {
    if (fileExt === 'xls' || fileExt === 'xlsx' || fileExt === 'doc' || fileExt === 'docx') {
      return true; // Si la extensión es 'xls', devolver false para no mostrar el botón
    } else if (fileSize.includes('KB')) {
      return true;
    } else if (this.extractFileSize(fileSize) < 30 && fileExt === 'pdf') {
      return true;
    } else if (this.extractFileSize(fileSize) < 30 && fileExt === 'jpg') {
      return true;
    } else if (this.extractFileSize(fileSize) < 30 && fileExt === 'jpeg') {
      return true;
    } else if (this.extractFileSize(fileSize) < 30 && fileExt === 'png') {
      return true;
    } else {
      return false;
    }
  }
  getRequestAssignedAttachments(request_id: number) {
    const payload: Pagination = {
      request_id: request_id,
      page: this.pageAssignedAttachments,
      page_size: this.rowsAssignedAttachments,
    };
    this.userService.getRequestAttachments(payload, 'assigned').subscribe({
      next: (response: BodyResponse<RequestAttachmentsList[]>) => {
        if (response.code === 200) {
          this.requestAssignedAttachmentsList = response.data;
          this.totalRowsAssignedAttachments = Number(response.message);
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
  getRequestHistoric(request_id: number) {
    const payload: Pagination = {
      request_id: request_id,
      page: this.pageHistoric,
      page_size: this.rowsHistoric,
    };
    this.userService.getRequestHistoric(payload).subscribe({
      next: (response: BodyResponse<RequestHistoric[]>) => {
        if (response.code === 200) {
          this.requestHistoric = response.data;
          this.fillStatesDetails(this.requestHistoric);
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

  fillStatesDetails(request: RequestHistoric[]): void {
    if (request && request.length > 0) {
      // Lista de estados que se deben agrupar
      const estadosAgrupados = [
        'Asignada',
        'Reasignada',
        'Asignada - En revisión',
        'Reasignada - En revisión',
        'Pendiente Usuario Externo',
      ];

      // Estados predeterminados
      const estadosPredeterminados = ['Radicada', 'Gestión', 'Cerrada'];

      // Objeto para almacenar los estados agrupados con la última fecha
      const groupedStates = request.reduce(
        (acc, item) => {
          const state = item.status_name;

          if (estadosAgrupados.includes(state)) {
            // Si el estado está en la lista de agrupados, verificar la fecha más reciente
            if (
              !acc['Gestión'] ||
              new Date(acc['Gestión'].updated_date) < new Date(item.updated_date)
            ) {
              acc['Gestión'] = { ...item, status_name: 'Gestión' }; // Cambiar nombre a 'Gestión'
            }
          } else {
            // Si no está en la lista de agrupados, guardar cada estado individualmente
            acc[`${state}-${item.updated_date}`] = item;
          }
          return acc;
        },
        {} as Record<string, RequestHistoric>
      );

      // Convertir el objeto agrupado en un arreglo de eventos
      this.events = Object.values(groupedStates).map(item => ({
        state: item.status_name,
        label: item.updated_date || 'No tiene',
        stateShow: item.status_name,
      }));

      // Asegurar que los estados predeterminados estén presentes
      estadosPredeterminados.forEach(state => {
        if (!this.events.some(event => event.state === state)) {
          this.events.push({
            state: state,
            label: 'No tiene',
            stateShow: state,
          });
        }
      });

      console.log(this.events, 'bu');
      this.currentIndex = this.events.findIndex(event => event.stateShow === this.currentState);
    } else {
      console.log('No hay datos históricos disponibles.');
    }
  }

  assignRequest(request_details: RequestsDetails) {
    if (request_details.assigned_user == null || request_details.assigned_user == '') {
      this.message = 'Asignar responsable al requerimiento';
      this.buttonmsg = 'Asignar';
      request_details.request_status = 2;
    } else {
      this.message = 'Reasignar responsable al requerimiento';
      this.buttonmsg = 'Reasignar';
      request_details.request_status = 3;
    }
    this.visibleDialogInput = true;
    this.parameter = ['Usuario'];
    this.request_details = request_details;
  }

  closeDialog(value: boolean) {
    this.visibleDialog = false;
    if (value) {
      //
    }
  }
  closeDialogInput(value: boolean) {
    this.visibleDialogInput = false;
    this.enableAssign = value;
    if (value) {
      // accion de eliminar
    }
  }
  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
  }
  closeDialogCharacterization(value: boolean) {
    this.visibleCharacterization = false;
  }
  setParameter(inputValue: {
    userName: string;
    userNameCompleted: string;
    mensajeReasignacion: string;
  }) {
    if (!this.enableAssign) return;
    if (this.request_details['assigned_user'] == inputValue.userName) {
      this.visibleDialogAlert = true;
      this.informative = true;
      this.message = 'Verifique el responsable a asignar';
      this.message2 =
        'Recuerde que, para realizar una reasignación, es necesario seleccionar un colaborador diferente';
      this.severity = 'danger';
      return;
    }
    this.request_details['assigned_user'] = inputValue.userName;
    this.request_details['user_name_completed'] = inputValue.userNameCompleted;
    this.request_details['mensaje_reasignacion'] = inputValue.mensajeReasignacion;

    if (inputValue) {
      this.userService.assignUserToRequest(this.request_details).subscribe({
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

  isValidExtension(file: File): boolean {
    const extensionesValidas = ['.jpeg', '.jpg', '.png', '.pdf', '.doc', '.xlsx', '.docx', '.xls'];
    const fileExtension = file?.name?.split('.').pop()?.toLowerCase();
    return !extensionesValidas.includes('.' + fileExtension);
  }
  openFileInput() {
    this.fileInput.nativeElement.value = ''; // Limpiar la entrada de archivos antes de abrir el cuadro de diálogo
    this.fileInput.nativeElement.click();
  }
  onFileSelected(event: any) {
    const files: FileList = event.target.files;

    for (let i = 0; i < files.length; i++) {
      if (this.fileNameList.includes(files[i].name)) {
        this.errorMensajeFile = `El archivo ${files[i].name} ya esta adjunto`;
        this.errorRepeatFile = true;
        continue;
      } else {
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

        if (file.size > 20971520) {
          this.errorMensajeFile = `El archivo ${files[i].name} supera los 20MB`;
          this.errorSizeFile = true;
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

          this.fileNameList.push(fileName);
          this.arrayAssignedAttachment.push(applicantAttach);
        };
        reader.readAsDataURL(file);
      }
    }
    setTimeout(() => {
      this.errorRepeatFile = false;
      this.errorExtensionFile = false;
      this.errorSizeFile = false;
    }, 5000);
  }

  getAssigned(): ApplicantAttachments[] {
    return this.arrayAssignedAttachment;
  }

  clearFileInput(index: number) {
    this.fileNameList.splice(index, 1);
    this.arrayAssignedAttachment.splice(index, 1);
  }

  //ANALISIS DE ORTOGRAFÍA
  characterizeRequestNoCorreccion(request_details: RequestsDetails) {
    //this.requestProcess.get('mensage')?.setValue(this.respuestaCorregida);
    this.visibleCorreccionIaEnviar = false;
    this.request_details = request_details;
    this.visibleCharacterization = true;
  }

  characterizeRequest(request_details: RequestsDetails) {
    this.requestProcess.get('mensage')?.setValue(this.respuestaCorregida);
    this.visibleCorreccionIaEnviar = false;
    this.request_details = request_details;
    this.visibleCharacterization = true;
  }
  submitAnswer() {
    const payloadAnswer: answerRequest = {
      request_id: this.request_id,
      request_status: 4,
      request_answer: this.requestProcess.get('mensage')?.value,
      assigned_attachments: null,
    };
    this.userService.answerRequest(payloadAnswer).subscribe({
      next: (response: BodyResponse<string>) => {
        if (response.code === 200) {
          this.requestProcess.reset();
          if (this.getAssigned().length == 0) {
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
            this.router.navigate([RoutesApp.PROCESS_REQUEST]);
          } else {
            this.attachAssignedFiles();
            this.router.navigate([RoutesApp.PROCESS_REQUEST]);
            this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
          }
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        this.requestProcess.reset();
        this.fileNameList = [];
        this.ngOnInit();
        console.log('La suscripción ha sido completada.');
      },
    });
  }
  async getPreSignedUrl(file: ApplicantAttachments) {
    const payload = {
      //source_name: file['source_name'],
      source_name: file['source_name'].replace(/(?!\.[^.]+$)\./g, '_'),
      fileweight: file['fileweight'],
      request_id: this.request_id,
    };
    this.userService.getUrlSigned(payload, 'assigned').subscribe({
      next: (response: BodyResponse<string>): void => {
        if (response.code === 200) {
          this.preSignedUrl = response.data;
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
        this.uploadToPresignedUrl(file);
        return this.preSignedUrl;
      },
    });
  }

  //ESCRIBE EN LA TABLA DE PENDIENTES PENDING
  async getPreSignedUrlPending(file: ApplicantAttachments) {
    const payload = {
      //source_name: file['source_name'],
      source_name: file['source_name'].replace(/(?!\.[^.]+$)\./g, '_'),
      fileweight: file['fileweight'],
      request_id: this.request_id,
    };
    this.userService.getUrlSigned(payload, 'pending').subscribe({
      next: (response: BodyResponse<string>): void => {
        if (response.code === 200) {
          this.preSignedUrl = response.data;
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
        this.uploadToPresignedUrl(file);
        return this.preSignedUrl;
      },
    });
  }

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
  }

  async attachAssignedFiles() {
    await Promise.all(
      this.arrayAssignedAttachment.map(async item => {
        await this.getPreSignedUrl(item);
      })
    );
  }

  async attachAssignedFilesPending() {
    await Promise.all(
      this.arrayAssignedAttachmentPending.map(async item => {
        await this.getPreSignedUrlPending(item);
      })
    );
  }
  ///////////////////////////////////////////////////////////////////////////////

  setParameterCharacterization(payload: CharacterizationCreate) {
    this.userService.characterizeRequest(payload).subscribe({
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
        this.submitAnswer();
        console.log('La suscripción ha sido completada.');
      },
    });
  }
  downloadFileS3(preSignedUrl: string, file_name: string): void {
    this.userService.downloadFileFromS3(preSignedUrl).subscribe(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = file_name;
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
      }, 0);
    });
  }
  displayFileInTab(preSignedUrl: string, file_name: string): void {
    this.userService
      .downloadFileFromS3(preSignedUrl)
      .toPromise()
      .then((blob: Blob | undefined) => {
        if (blob) {
          return this.blobToBase64(blob);
        } else {
          throw new Error('Downloaded file is undefined');
        }
      })
      .then((base64String: string) => {
        const fileType = file_name.split('.');
        const file_extension = fileType[fileType.length - 1];
        const dataUrl = 'data:application/pdf;base64,' + base64String;
        this.convertBase64ToBlobAndOpenInNewTab(base64String, file_name, file_extension);
      })
      .catch(error => {
        console.error('Error downloading file:', error);
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

  addBase64Header(base64Data: string, fileName: string): string {
    const fileType = fileName.split('.')[-1];
    return `data:${fileType};base64,${base64Data.split(',')[1]}`;
  }

  /*
  async getPreSignedUrlToDownload(url: string, file_name: string, is_download: boolean) {
    const payload = {
      url: url,
    };
    this.userService.getUrlSigned(payload, 'download').subscribe({
      next: (response: BodyResponse<string>): void => {
        if (response.code === 200) {
          this.preSignedUrlDownload = response.data;
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
        if (is_download) {
          this.downloadFileS3(this.preSignedUrlDownload, file_name);
        } else {
          this.displayFileInTab(this.preSignedUrlDownload, file_name);
        }
        return this.preSignedUrlDownload;
      },
    });
  } */

  async getPreSignedUrlToDownload(url: string, file_name: string, is_download: boolean) {
    const payload = { url: url };
    this.userService.getUrlSigned(payload, 'download').subscribe({
      next: (response: BodyResponse<string>): void => {
        if (response.code === 200) {
          this.preSignedUrlDownload = response.data;
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
        this.viewerType = this.getViewerType(file_name);
        if (!is_download) {
          if (this.viewerType == 'pdf') {
            this.isSpinnerVisible = true;
            this.displayFileInTab(this.preSignedUrlDownload, file_name);
          } else {
            this.displayPreviewModal = true;
          }
        } else {
          this.downloadFileS3(this.preSignedUrlDownload, file_name);
        }
        return this.preSignedUrlDownload;
      },
    });
  }

  getViewerType(file_name: string): 'google' | 'office' | 'image' | 'pdf' {
    const extension = file_name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'docx':
      case 'doc':
      case 'xlsx':
      case 'xls':
        return 'office';
      case 'png':
      case 'jpg':
      case 'jpeg':
        return 'image';
      default:
        return 'google'; // Valor predeterminado
    }
  }

  //showModal() {
  //  this.visibleDialogdDescrip = true;
  //}

  //showModalRadicada() {
  //  this.visibleDialogdDescripRadicada = true;
  //}

  showModalRadicada() {
    this.dialogHeader = 'Descripción de la solicitud';
    this.dialogContent = this.requestDetails?.request_description || '';
    this.isDialogVisible = true;
  }

  showModal() {
    this.dialogHeader = 'Respuesta de la solicitud';
    this.dialogContent = this.requestDetails?.request_answer || '';
    this.isDialogVisible = true;
  }

  showModalReasignada(user_name: string) {
    this.dialogHeader = 'Descripción de la reasignación';
    this.requestHistoric.forEach((request: RequestHistoric) => {
      if (user_name === request.user_name_completed && request.status_name === 'Reasignada') {
        this.dialogContent = request.answer_request;
      }
    });
    this.isDialogVisible = true;
  }

  showModalReview(user_name: string, request_name: string) {
    this.dialogHeader = 'Descripción de la revisión';
    this.requestHistoric.forEach((request: RequestHistoric) => {
      if (user_name === request.user_name_completed && request.status_name === request_name) {
        this.dialogContent = request.answer_request;
      }
    });
    this.isDialogVisible = true;
  }

  /*
  respuestaSugeridaIa(requestDescription: string): void {

    // Verifica que `requestDescription` no sea undefined o vacío
    const description = this.requestDetails?.request_description;
    
    if (!description) {
      console.error('Descripción del mensaje no disponible.');
      return;
    }
  
    console.log(description);
  
    // Llama al servicio para obtener la respuesta de IA
    this.userService.respuestaIaWs(description).subscribe(
      (response) => {
        // Maneja la respuesta
        this.responseData = response;
        console.log(this.responseData);
  
        if (this.responseData.statusCode === 200) {
          console.log('Respuesta exitosa:', this.responseData);
  
          // Muestra el diálogo con la respuesta
          this.visibleDialogIa = true;
          //this.informative = true;
          this.message = response.body;
        } else {
          console.error('Error en la respuesta de IA. Código:', response.code);
        }
      },
      (error) => {
        // Maneja el error en la solicitud HTTP
        console.error('Error en la solicitud de respuesta IA:', error);
      }
    );
  } */

  respuestaSugeridaIa(requestDescription: string) {
    console.log(this.requestDetails?.request_description);

    this.userService.respuestaIaWs(this.requestDetails?.request_description).subscribe(response => {
      if (response.statusCode === 200) {
        // El cuerpo de la respuesta está en response.body y es un string JSON
        const responseBody = response.body;

        try {
          // Analizar el cuerpo JSON
          const parsedBody = JSON.parse(responseBody);

          // Extraer los datos
          const categoria = parsedBody.categoria || 'Categoría no disponible';
          let respuestaPredefinida = parsedBody.respuestaPredefinida || 'Respuesta no disponible';

          // Reemplazar los asteriscos por el nombre del usuario
          if (this.requestDetails && this.requestDetails.user_name_completed) {
            const userName = this.requestDetails.user_name_completed;
            respuestaPredefinida = respuestaPredefinida.replace(/\*+ */g, userName);
          }

          // Asignar estos valores a variables locales o a propiedades del componente
          this.categoria = categoria;
          this.respuestaPredefinida = respuestaPredefinida;

          // Mostrar el modal
          this.visibleDialogIa = true;
          this.informative = true;
        } catch (error) {
          console.error('Error al procesar la respuesta del servicio:', error);
        }
      } else {
        console.error('Error en la respuesta del servicio:', response);
      }
    });
  }

  confirmarRespuesta() {
    // Reemplaza los asteriscos en la respuesta con el nombre del usuario
    const userName = this.requestDetails?.user_name_completed || '';
    const respuestaConNombre =
      'Hola, buen día!\n \n' +
      this.respuestaPredefinida +
      ' \n \nCordialmente, ' +
      this.requestDetails?.user_name_completed;

    // Establece el valor del textarea en el formulario
    this.requestProcess.get('mensage')?.setValue(respuestaConNombre);

    // Cierra el modal
    this.visibleDialogIa = false;
  }

  cancelar() {
    this.visibleDialogIa = false;
  }

  guardarBorrador(requestDetails: RequestsDetails) {
    this.userService.checkServiceAvailability().subscribe(isAvailable => {
      if (isAvailable) {
        console.log('Servicio disponible en este momento.');
        this.correccionSugeridaIa(requestDetails);
      } else {
        console.error('El servicio no está disponible en este momento.');
        this.showSuccessMessage('error', 'Fallida', 'IA no disponible en este momento!');
      }
    });
  }

  correccionSugeridaIa(requestDetails: RequestsDetails) {
    const respuestaForm = this.requestProcess.get('mensage')?.value;
    console.log(respuestaForm);

    this.userService.correccionIaWs(respuestaForm).subscribe(response => {
      if (response.statusCode === 200) {
        // El cuerpo de la respuesta está en response.body y es un string JSON
        const responseBody = response.body;

        try {
          // Analizar el cuerpo JSON
          const parsedBody = JSON.parse(responseBody);

          // Extraer los datos
          const respuesta = JSON.parse(parsedBody.respuesta) || 'Respuesta no disponible';

          // Asignar estos valores a variables locales o a propiedades del componente
          this.respuestaCorregida = respuesta.texto_corregido;
          this.palabrasError = respuesta.palabras_con_errores;
          this.respuestaSolicitud = respuestaForm;
          this.errores = respuesta.errores_encontrados;

          console.log(this.respuestaCorregida);
          console.log(this.palabrasError);
          console.log(this.errores);

          // Mostrar el modal si hay errores
          if (this.errores) {
            this.visibleCorreccionIa = true;
            this.informative = true;
          } else {
            this.borradorRespuesta(requestDetails);
          }
        } catch (error) {
          console.error('Error al procesar la respuesta del servicio:', error);
        }
      } else {
        console.error('Error en la respuesta del servicio:', response);
      }
    });
  }

  //NUEVA PARA ENVIAR
  correccionSugeridaIaEnviar(requestDetails: RequestsDetails) {
    const respuestaForm = this.requestProcess.get('mensage')?.value;
    console.log(respuestaForm);

    this.userService.correccionIaWs(respuestaForm).subscribe(response => {
      if (response.statusCode === 200) {
        // El cuerpo de la respuesta está en response.body y es un string JSON
        const responseBody = response.body;

        try {
          // Analizar el cuerpo JSON
          const parsedBody = JSON.parse(responseBody);

          // Extraer los datos
          const respuesta = JSON.parse(parsedBody.respuesta) || 'Respuesta no disponible';

          // Asignar estos valores a variables locales o a propiedades del componente
          this.respuestaCorregida = respuesta.texto_corregido;
          this.palabrasError = respuesta.palabras_con_errores;
          this.respuestaSolicitud = respuestaForm;
          this.errores = respuesta.errores_encontrados;

          console.log(this.respuestaCorregida);
          console.log(this.palabrasError);
          console.log(this.errores);

          // Mostrar el modal si hay errores
          if (this.errores) {
            this.visibleCorreccionIaEnviar = true;
            this.informative = true;
          } else {
            this.characterizeRequest(requestDetails);
          }
        } catch (error) {
          console.error('Error al procesar la respuesta del servicio:', error);
        }
      } else {
        console.error('Error en la respuesta del servicio:', response);
      }
    });
  }

  confirmarCorreccion() {
    console.log(this.respuestaCorregida);
    // Establece el valor del textarea en el formulario
    this.requestProcess.get('mensage')?.setValue(this.respuestaCorregida);

    // Cierra el modal
    this.visibleCorreccionIa = false;
  }

  /*
  cancelarCorreccion() {
    this.visibleCorreccionIa = false;
  } */

  cancelarCorreccionEnviar(requestDetails: RequestsDetails) {
    this.visibleCorreccionIaEnviar = false;
    this.characterizeRequest(requestDetails);
  }

  consultarWs(cedula: string) {
    this.userService.respuestaInfoAfiliacion(cedula).subscribe(
      response => {
        if (response.statusCode === 200) {
          const parsedBody = JSON.parse(response.body);
          this.afiliado = parsedBody;
          if (this.afiliado) {
            this.afiliado.tipoDocumento = this.getTipoDocumentoTexto(parsedBody.data.tipodoc);
            this.afiliado.documento = cedula;
            this.afiliado.nombre = parsedBody.data.nombre;
            this.afiliado.fechaNacimiento = parsedBody.data.fechanac;
            this.afiliado.estado = parsedBody.data.estado;
            this.afiliado.tipoTrabajador = this.getTipoTrabajadorTexto(parsedBody.data.tipotr);
            this.afiliado.empresa = parsedBody.data.nombreempresa;
            this.afiliado.fechaAfiliacion = parsedBody.data.fechaafi;
            this.afiliado.fechaIngreso = parsedBody.data.fechaing;
          }
        }
      },
      (error: any) => {
        console.error('Error al llamar al servicio:', error);
      }
    );
  }

  getTipoTrabajadorTexto(tipo: string): string {
    switch (tipo) {
      case 'T':
        return 'TRABAJADOR DEPENDIENTE';
      case 'A':
      case 'N':
        return 'TRABAJADOR INDEPENDIENTE';
      case 'J':
      case 'P':
      case 'G':
      case 'B':
        return 'PENSIONADO';
      case 'D':
        return 'DESEMPLEADO PARA SERVICIOS';
      default:
        return '';
    }
  }

  getTipoDocumentoTexto(tipo: string): string {
    switch (tipo) {
      case 'C':
        return 'CEDULA CIUDADANIA';
      case 'E':
        return 'CEDULA EXTRANJERIA';
      case 'v':
        return 'PERMISO ESPECIAL PERMANENCIA';
      case 'M':
        return 'PERMISO PROTECCION TEMPORAL';
      case 'P':
        return 'PASAPORTE';
      default:
        return '';
    }
  }

  borradorRespuesta(requestDetails: RequestsDetails) {
    //const respuestaBorrador = this.requestProcess.get('mensage')?.value;
    this.requestProcess.get('mensage')?.setValue(this.respuestaCorregida);
    const respuestaBorrador = this.requestProcess.get('mensage')?.value;
    const payload: RequestAnswerTemp = {
      request_id: requestDetails.request_id,
      mensaje_temp: respuestaBorrador || '',
    };

    this.userService.createAnswerTemp(payload).subscribe({
      next: (response: BodyResponse<string>): void => {
        if (response.code === 200) {
          this.respuestaTemp = response.data;
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        this.existEraserAsnwer = true;
        console.log('La suscripción ha sido completada.');
        this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
        return this.respuestaTemp;
      },
    });
    this.visibleCorreccionIa = false;
  }

  borradorRespuestaNoCorregida(requestDetails: RequestsDetails) {
    const respuestaBorrador = this.requestProcess.get('mensage')?.value;
    const payload: RequestAnswerTemp = {
      request_id: requestDetails.request_id,
      mensaje_temp: respuestaBorrador || '',
    };

    this.userService.createAnswerTemp(payload).subscribe({
      next: (response: BodyResponse<string>): void => {
        if (response.code === 200) {
          this.respuestaTemp = response.data;
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        this.existEraserAsnwer = true;
        console.log('La suscripción ha sido completada.');
        this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
        return this.respuestaTemp;
      },
    });
    this.visibleCorreccionIa = false;
  }

  getAnswerTemp(request_id: number) {
    const payload: RequestAnswerTemp = {
      request_id: request_id,
      mensaje_temp: '',
    };
    this.userService.getAnswerTemp(payload).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.respuestaTemp = response.data[0].request_answer_temp;
          if (this.respuestaTemp !== '') {
            this.requestProcess.get('mensage')?.setValue(this.respuestaTemp);
            this.existEraserAsnwer = true;
          }
        } else {
          this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('La suscripción ha sido completada.');
        console.log(this.respuestaTemp);
        return this.respuestaTemp;
      },
    });
  }

  solicitudPendiente() {
    this.visibleSolicitudPendiente = true;
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach(file => this.selectedFilesPending.push(file));
    }
  }

  //PROCESO PARA DEJAR UNA SOLICUTD PENDIENTE
  onSubmit1(): void {
    const formData = new FormData();
    formData.append('message', this.pendingRequestForm.get('message')?.value);

    // Agregar todos los archivos al FormData
    this.selectedFilesPending.forEach(file => formData.append('files', file));

    console.log('Formulario enviado:', this.requestDetails?.status_name);
    console.log('Mensaje:', this.pendingRequestForm.get('message')?.value);
    //console.log('Formulario enviado:', formData);

    // Aquí enviarías los datos al backend
    // this.myService.submitRequest(formData).subscribe(response => ...);

    // Cerrar el diálogo después de enviar
    this.closeDialogPending();
  }


  //REALIZA PROCESO DE PONER SOLICITUD EN PENDIENTE
  onSubmit(): void {
    if (this.pendingRequestForm.valid) {
      // Captura el valor del formulario
      const formValue = this.pendingRequestForm.value;

      // Prepara FormData para incluir archivos y datos
      const formData = new FormData();
      formData.append('message', formValue.message);

      // Agrega los archivos seleccionados al FormData
      this.selectedFilesPending.forEach(file => {
        formData.append('files', file);
      });

      // Llama al servicio para enviar los datos
      const token = this.generateToken();

      console.log(token);

      const payload: PendingRequest = {
        request_id: this.requestDetails?.filing_number || 0,
        token: token,
        pending: true,
        message: this.pendingRequestForm.get('message')?.value,
        previus_state: this.requestDetails?.status_name,
      };

      console.log(payload);

      this.userService.registerPendingRequest(payload).subscribe({
        next: (response: BodyResponse<string>) => {
          if (response.code === 200) {
            if (this.getAssignedPending().length == 0) {
              this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
              this.router.navigate([RoutesApp.PROCESS_REQUEST]);
              this.ngOnInit();
            } else {
              this.attachAssignedFilesPending();
              this.router.navigate([RoutesApp.PROCESS_REQUEST]);
              this.ngOnInit();
              this.showSuccessMessage('success', 'Exitoso', 'Operación exitosa!');
            }
          } else {
            this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
          }
        },
        error: (err: any) => {
          console.log(err);
        },
        complete: () => {
          console.log('La suscripción ha sido completada.');
          console.log('Solicitud en estado pendiente');
          this.closeDialogPending();
        },
      });
    } else {
      this.pendingRequestForm.markAllAsTouched(); // Marca los campos para mostrar errores
    }
  }

  closeDialogPending(): void {
    this.visibleSolicitudPendiente = false;
    this.pendingRequestForm.reset();
    this.selectedFile = null;
  }

  removeFile(index: number): void {
    this.selectedFilesPending.splice(index, 1);
  }

  /*
  closeDialogPendiente(value: boolean) {
    const token = this.generateToken();

    console.log(token)

    const payload: PendingRequest = {
      request_id: this.request_details?.request_id || 0,
      token: token,
      pending: true,
    };
    this.userService.registerPendingRequest(payload).subscribe({
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
        console.log('La suscripción ha sido completada.');
        console.log("Solicitud en estado pendiente"); 
      },
    });   
  } */

  generateToken() {
    const uuid = uuidv4().replace(/-/g, '');

    // Crear la fecha local
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const formattedDate = `${year}${month}${day}T${hours}${minutes}${seconds}`;

    // UUID + fecha
    const token = `${uuid}${formattedDate}`;
    return token;
}

openFileInputPending() {
  this.fileInputPending.nativeElement.value = ''; // Limpiar la entrada de archivos antes de abrir el cuadro de diálogo
  this.fileInputPending.nativeElement.click();
}

onFileSelectedPending(event: any) {
  const filesPending: FileList = event.target.files;

  for (let i = 0; i < filesPending.length; i++) {
    if (this.fileNameListPending.includes(filesPending[i].name)) {
      this.errorMensajeFile = `El archivo ${filesPending[i].name} ya esta adjunto`;
      this.errorRepeatFile = true;
      continue;
    } else {
      const file: File = filesPending[i];

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
        this.errorMensajeFile = `El archivo ${filesPending[i].name} tiene una extension no permitida`;
        this.errorExtensionFile = true;
        continue;
      }

      if (file.size > 20971520) {
        this.errorMensajeFile = `El archivo ${filesPending[i].name} supera los 20MB`;
        this.errorSizeFile = true;
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String: string = e.target.result.split(',')[1];

        const applicantAttach: ApplicantAttachments = {
          base64file: base64String,
          source_name: fileName,
          fileweight: fileSizeFormat,
          file: filesPending[i],
        };

        this.fileNameListPending.push(fileName);
        this.arrayAssignedAttachmentPending.push(applicantAttach);
      };
      reader.readAsDataURL(file);
    }
  }
  setTimeout(() => {
    this.errorRepeatFile = false;
    this.errorExtensionFile = false;
    this.errorSizeFile = false;
  }, 5000);
  
  console.log(this.getAssignedPending());
}

getAssignedPending(): ApplicantAttachments[] {
  return this.arrayAssignedAttachmentPending;
}

clearFileInputPending(index: number) {
  this.fileNameListPending.splice(index, 1);
  this.arrayAssignedAttachmentPending.splice(index, 1);
}


  envioCorreoMasivo() {
    this.visibleSolicitudEnvioMasivo = true;
  }

  closeDialogenvioCorreoMasivo(): void {
    this.visibleSolicitudEnvioMasivo = false;
    this.emailList = []; // Limpia la lista de correos
    this.errorMessage = '';
    this.envioMasivoForm.reset();
  }

  // Añadir correo a la lista
  addEmail(): void {
    const email = this.envioMasivoForm.get('email')?.value;

    // Validar si el campo de correo no está vacío y tiene un formato de correo válido
    if (!email || !this.isValidEmail(email)) {
      this.errorMessage = 'Debe introducir un correo válido.';
      return; // Detiene la ejecución si el correo no es válido
    }

    // Verificar si el correo ya está en la lista
    if (this.emailList.includes(email)) {
      this.errorMessage = 'El correo ya está en la lista.';
      return;
    }

    // Añadir el correo a la lista si es válido
    this.emailList.push(email);
    this.envioMasivoForm.get('email')?.reset(); // Limpiar el campo de correo
    this.errorMessage = ''; // Limpiar cualquier mensaje de error
  }

  // Función para verificar si el correo tiene un formato válido
  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  // Eliminar correo de la lista
  removeEmail(index: number) {
    this.emailList.splice(index, 1);
  }

  onSubmitRepuestaMasivo(): void {
    if (!this.emailList || this.emailList.length === 0) {
      this.errorMessage = 'Debe añadir al menos un correo antes de enviar.';
      return;
    }

    const payload: sendEmail = {
      request_id: this.requestDetails?.filing_number || 0,
      email: this.emailList,
    };

    this.userService.sendEmailAll(payload).subscribe({
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
        console.log('La suscripción ha sido completada.');
        this.closeDialogenvioCorreoMasivo();
      },
    });
  }

  isValidDate(value: string): boolean {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  solicitudHistory() {
    this.visibleHistory = true;
  }

  closeDialogHistory(): void {
    this.visibleHistory = false;
  }

  getHistoryRequest(request_id: number) {
    const payload: requestHistoryRequest = {
      request_id: request_id,
    };
    this.userService.getHistoryRequest(payload).subscribe({
      next: (response: BodyResponse<historyRequest[]>) => {
        if (response.code === 200) {
          this.historyData = response.data;
          console.log(this.historyData, 'aa');
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
}
