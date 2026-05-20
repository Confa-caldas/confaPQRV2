import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators, ValidationErrors } from '@angular/forms';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import {
  ApplicantAttachments,
  ApplicantTypeList,
  RequestFormList,
  RequestTypeList,
  ErrorAttachLog,
  ProcessRequest,
} from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { RoutesApp } from '../../../enums/routes.enum';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { HttpEventType, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { throwError, retry, lastValueFrom, firstValueFrom  } from 'rxjs';
import { catchError, retryWhen, delay, take, tap } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-request-form',
  templateUrl: './request-form.component.html',
  styleUrl: './request-form.component.scss',
})
export class RequestFormComponent implements OnInit, OnDestroy {
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
  authorize_data: boolean = false;
  minError: string = '';
  maxError: string = '';
  requiredDocuments: {
    document_type_id: number;
    document_type_description: string;
  }[] = [];
  uploadedFiles: { [key: string]: File } = {};

  /** URLs blob para previsualizar adjuntos obligatorios (clave = document_type_description). */
  requiredDocPreviewUrls: { [key: string]: string } = {};

  /** URLs blob para previsualizar adjuntos opcionales (clave = nombre de archivo). */
  optionalAttachmentPreviews: { [key: string]: string } = {};

  /** Nombres en proceso de lectura (evita solapamiento entre distintos inputs de archivo). */
  private pendingUploadByName = new Set<string>();

  /** Mensaje de nombre duplicado solo bajo el input donde ocurrió el intento. */
  duplicateFileErrorMessage: string | null = null;
  /** 'optional' o document_type_id del obligatorio (puede venir como número o string del JSON). */
  duplicateFileErrorTarget: 'optional' | number | string | null = null;

  /** Oculta el mensaje de duplicado tras un tiempo; se reinicia en cada nuevo intento fallido. */
  private duplicateFileErrorClearHandle: ReturnType<typeof setTimeout> | null = null;
  private readonly duplicateFileMessageDurationMs = 4000;

  /** Modal de vista previa de adjunto */
  previewDialogVisible = false;
  previewModalTitle = '';
  previewModalUrl: string | null = null;
  previewIframeUrl: SafeResourceUrl | null = null;
  previewModalShowImage = false;
  previewModalShowPdf = false;
  previewModalShowUnsupported = false;

  objectKeys = Object.keys;


  ngOnInit(): void {
    let applicant = localStorage.getItem('applicant-type');
    let request = localStorage.getItem('request-type');
    const visitedFirstPage = localStorage.getItem('visitedFirstPage');
    const authorize_data_raw = localStorage.getItem('authorize_data');
    this.authorize_data = authorize_data_raw ? JSON.parse(authorize_data_raw) : null;

    const storedDocs = localStorage.getItem('requiredDocuments');
    this.requiredDocuments = storedDocs ? JSON.parse(storedDocs) : [];

    console.log('Documentos requeridos cargados:', this.requiredDocuments);


    //console.log(visitedFirstPage);

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
        console.log('requestType recuperado:', this.requestType);
      }
      this.getApplicantList();
      this.requestForm.get('number_id')?.disable();
    }
  }

  ngOnDestroy(): void {
    this.revokeAllPreviewUrls();
    this.pendingUploadByName.clear();
    this.clearDuplicateFileError();
  }

  constructor(
    private formBuilder: FormBuilder,
    private userService: Users,
    private messageService: MessageService,
    private router: Router,
    private http: HttpClient,
    private changeDetectorRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
    this.value = {
      catalog_item_id: 1,
      catalog_item_name: 'NIT',
      regex: '^[0-9]{0,9}$',
    };
    this.requestForm = this.formBuilder.group(
    {
      document_type: ['', Validators.required],
      number_id: ['', Validators.required],
      name: ['', [Validators.required, Validators.pattern('^[^@#$%&]+$')]],
      cellphone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
        ],
      ],
      validator_email: ['', [Validators.required]],
      mensage: ['', [Validators.required, Validators.maxLength(1000)]],
    },
    {
      validators: [
        this.emailMatcher,
        this.validateAttachments.bind(this),
      ],
    }
  );

    /*
    this.requestForm.get('document_type')?.valueChanges.subscribe(value => {
      //this.requestForm.get('number_id')?.setValidators([Validators.pattern(value.regex)]);
      this.requestForm.get('number_id')?.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(value.regex),
      ]);
      this.requestForm.get('number_id')?.updateValueAndValidity();
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
    }); */
    /*
    this.requestForm.get('document_type')?.valueChanges.subscribe(value => {
      const numberIdControl = this.requestForm.get('number_id');
    
      if (!value) return;
    
      const validators = [
        Validators.required,
        Validators.minLength(7),
        Validators.pattern(value.regex || '^[0-9]+$') // fallback si no hay regex
      ];
    
      // Aplicar máximos según tipo
      if (value.catalog_item_id === 1) {
        validators.push(Validators.maxLength(11));
        this.errorMensaje = 'Ingrese solo números y máximo 11 dígitos';
      } else if (value.catalog_item_id === 15) {
        validators.push(Validators.maxLength(12));
        this.errorMensaje = 'Ingrese solo números y máximo 12 dígitos';
      } else if (value.catalog_item_id === 0) {
        this.errorMensaje = 'Ingrese solo números';
      } else if (value.catalog_item_id === 16) {
        this.errorMensaje = 'Formato inválido';
      } else {
        this.errorMensaje = '';
      }
    
      numberIdControl?.setValidators(validators);
      numberIdControl?.updateValueAndValidity();
      numberIdControl?.enable();
    }); */
    this.requestForm.get('document_type')?.valueChanges.subscribe(value => {
      const numberIdControl = this.requestForm.get('number_id');
      if (!value || !numberIdControl) return;

      const documentRules: { [key: number]: { minLength?: number, maxLength?: number, regex: string, message: string, minMsg?: string, maxMsg?: string } } = {
        0:  { minLength: 7, maxLength: 10, regex: '^[0-9]+$', message: 'Solo números permitidos', minMsg: 'Debe contener al menos 7 dígitos', maxMsg: 'Máximo 10 dígitos permitidos' },
        15: { minLength: 6, maxLength: 15, regex: '^[0-9]+$', message: 'Solo números permitidos', minMsg: 'Debe contener al menos 6 dígitos', maxMsg: 'Máximo 15 dígitos permitidos' },
        17: { minLength: 6, maxLength: 15, regex: '^[A-Za-z0-9]+$', message: 'Ingrese 15 caracteres alfanuméricos', minMsg: 'Debe contener al menos 6 dígitos', maxMsg: 'Máximo 15 dígitos permitidos' },
        1:  { minLength: 5, maxLength: 11, regex: '^[0-9]+$', message: 'Solo números permitidos', minMsg: 'Debe contener al menos 5 dígitos', maxMsg: 'Máximo 11 dígitos permitidos' },
        16: { minLength: 7, maxLength: 20, regex: '^[A-Za-z0-9]+$', message: 'Ingrese entre 5 y 20 caracteres alfanuméricos', minMsg: 'Debe contener al menos 5 caracteres', maxMsg: 'Máximo 20 caracteres permitidos' },
      };

      const rules = documentRules[value.catalog_item_id];

      if (!rules) {
        numberIdControl.clearValidators();
        numberIdControl.updateValueAndValidity();
        this.errorMensaje = '';
        this.minError = '';
        this.maxError = '';
        return;
      }

      const validators = [
        Validators.required,
        Validators.pattern(rules.regex)
      ];
      if (rules.minLength) validators.push(Validators.minLength(rules.minLength));
      if (rules.maxLength) validators.push(Validators.maxLength(rules.maxLength));

      numberIdControl.setValidators(validators);
      numberIdControl.updateValueAndValidity();
      numberIdControl.enable();

      this.errorMensaje = rules.message;
      this.minError = rules.minMsg ?? '';
      this.maxError = rules.maxMsg ?? '';
    });
    
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

  /*
  emailMatcher: ValidatorFn = (formControl: AbstractControl) => {
    const email = formControl.get('email')?.value;
    const emailConfirmed = formControl.get('validator_email')?.value;
    return email === emailConfirmed ? null : { notMatched: true };
  };
  */

  emailMatcher: ValidatorFn = (formGroup: AbstractControl): ValidationErrors | null => {
    const email = formGroup.get('email')?.value?.trim();
    const emailConfirmed = formGroup.get('validator_email')?.value?.trim();

    if (!email || !emailConfirmed) {
      return null; // no validar si falta alguno
    }

    return email === emailConfirmed ? null : { notMatched: true };
  };


  openFileInput() {
    this.fileInput.nativeElement.value = ''; // Limpiar la entrada de archivos antes de abrir el cuadro de diálogo
    this.fileInput.nativeElement.click();
  }

  /*
  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (this.arrayApplicantAttachment.length === 0) {
      this.fileNameList.clear();
    }

    for (let i = 0; i < files.length; i++) {
      //const file: File = files[i];
      let file: File = files[i];

      //Verifica si es imagen y viene desde movil
      const isImage = file.type.startsWith('image/');
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      // Renombrar solo si es imagen y viene desde móvil
      if (isImage && isMobile) {
        const extension = file.name.split('.').pop();
        const timestamp = new Date().getTime(); // genera un número único basado en tiempo
        const newName = `photo_${timestamp}.${extension}`;
        file = new File([file], newName, { type: file.type });
      }

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
    */

  /*
  onFileSelected(event: any, doc?: any) {
  const files: FileList = event.target.files;
  if (this.arrayApplicantAttachment.length === 0) {
    this.fileNameList.clear();
  }

  const isRequiredDoc = !!doc; // indica si el archivo viene de los documentos requeridos

  for (let i = 0; i < files.length; i++) {
    let file: File = files[i];

    // --- Verifica si es imagen y viene desde móvil ---
    const isImage = file.type.startsWith('image/');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isImage && isMobile) {
      const extension = file.name.split('.').pop();
      const timestamp = new Date().getTime();
      const newName = `photo_${timestamp}.${extension}`;
      file = new File([file], newName, { type: file.type });
    }

    // --- Tamaño formateado ---
    const fileName: string = file.name;
    const fileSizeInKiloBytes = file.size / 1024;
    const fileSizeFormat =
      fileSizeInKiloBytes < 1024
        ? `${fileSizeInKiloBytes.toFixed(2)}KB`
        : `${(fileSizeInKiloBytes / 1024).toFixed(2)}MB`;

    // --- Validaciones ---
    if (this.isValidExtension(file)) {
      this.errorMensajeFile = `El archivo ${fileName} tiene una extensión no permitida.`;
      this.errorExtensionFile = true;
      continue;
    }

    if (file.size > 30720000) {
      this.errorMensajeFile = `El archivo ${fileName} supera los 30MB.`;
      this.errorSizeFile = true;
      continue;
    }

    const exists = this.arrayApplicantAttachment.some(
      (item) => item.source_name === fileName
    );
    if (exists) {
      this.errorMensajeFile = `El archivo ${fileName} ya está adjunto.`;
      this.errorRepeatFile = true;
      continue;
    }

    // --- Convertir a Base64 ---
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64String: string = e.target.result.split(',')[1];

      // --- Estructura del adjunto ---
      const applicantAttach: ApplicantAttachments = {
        base64file: base64String,
        source_name: fileName,
        fileweight: fileSizeFormat,
        file,
        // nuevo campo para asociar al documento requerido
        document_type_id: isRequiredDoc ? doc.document_type_id : null,
      };

      // --- Guardar en el arreglo global ---
      this.fileNameList.add(fileName);
      this.arrayApplicantAttachment.push(applicantAttach);

      // --- Si es documento requerido, guardar referencia ---
      if (isRequiredDoc) {
        if (!this.uploadedFiles) this.uploadedFiles = {}; // inicializar si no existe
        this.uploadedFiles[doc.document_type_description] = file;
      }
    };
    reader.readAsDataURL(file);
  }

  console.log(this.arrayApplicantAttachment, 'seleccionados');

  // --- Limpiar errores después de 5 segundos ---
  setTimeout(() => {
    this.errorRepeatFile = false;
    this.errorExtensionFile = false;
    this.errorSizeFile = false;
  }, 5000);
}
  */

  onFileSelected(event: any, doc?: any) {
  const files: FileList = event.target.files;
  if (!files || files.length === 0) return;

  const isRequiredDoc = !!doc; // indica si el archivo viene de los documentos requeridos

  const duplicateCtx =
    isRequiredDoc && doc
      ? {
          replaceDocumentTypeId: doc.document_type_id,
          replaceDocumentDescription: doc.document_type_description,
        }
      : undefined;
  const duplicateErrorTarget: 'optional' | number | string = isRequiredDoc ? doc.document_type_id : 'optional';

  // Solo limpiar lista si no hay adjuntos y no es documento obligatorio
  if (!isRequiredDoc && this.arrayApplicantAttachment.length === 0) {
    this.fileNameList = new Set<string>(); // aseguramos que sea un nuevo Set vacío
  }

  for (let i = 0; i < files.length; i++) {
    let file: File = files[i];

    // --- Verifica si es imagen y viene desde móvil ---
    const isImage = file.type.startsWith('image/');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isImage && isMobile) {
      const extension = file.name.split('.').pop();
      const timestamp = new Date().getTime();
      const newName = `photo_${timestamp}.${extension}`;
      file = new File([file], newName, { type: file.type });
    }

    // --- Tamaño formateado ---
    const fileName: string = file.name;
    const fileSizeInKiloBytes = file.size / 1024;
    const fileSizeFormat =
      fileSizeInKiloBytes < 1024
        ? `${fileSizeInKiloBytes.toFixed(2)}KB`
        : `${(fileSizeInKiloBytes / 1024).toFixed(2)}MB`;

    // --- Validaciones ---
    if (this.isValidExtension(file)) {
      this.errorMensajeFile = `El archivo ${fileName} tiene una extensión no permitida.`;
      this.errorExtensionFile = true;
      continue;
    }

    if (file.size > 30720000) {
      this.errorMensajeFile = `El archivo ${fileName} supera los 30MB.`;
      this.errorSizeFile = true;
      continue;
    }

    const nameKey = this.fileNameKey(fileName);

    // --- Mismo nombre en cualquier adjunto (opcional u obligatorio) o lectura en curso ---
    if (
      this.pendingUploadByName.has(nameKey) ||
      this.isFileNameAlreadyAttached(fileName, duplicateCtx)
    ) {
      this.notifyDuplicateFileName(fileName, duplicateErrorTarget);
      continue;
    }

    this.pendingUploadByName.add(nameKey);

    // --- Convertir a Base64 ---
    const reader = new FileReader();
    reader.onerror = () => {
      this.pendingUploadByName.delete(nameKey);
    };
    reader.onload = (e: any) => {
      try {
        if (this.isFileNameAlreadyAttached(fileName, duplicateCtx)) {
          this.notifyDuplicateFileName(fileName, duplicateErrorTarget);
          return;
        }

        this.clearDuplicateFileError();

        const base64String: string = e.target.result.split(',')[1];

        // --- Estructura del adjunto ---
        const applicantAttach: ApplicantAttachments = {
          base64file: base64String,
          source_name: fileName,
          fileweight: fileSizeFormat,
          file,
          document_type_id: isRequiredDoc ? doc.document_type_id : null,
        };

        // --- Registrar tanto en el mapa de obligatorios como en el arreglo principal ---
        if (isRequiredDoc) {
          if (!this.uploadedFiles) this.uploadedFiles = {};
          // Reemplazar adjunto previo del mismo tipo (evita duplicados y libera la vista previa).
          this.arrayApplicantAttachment = this.arrayApplicantAttachment.filter(
            item => !this.sameDocumentTypeId(item.document_type_id, doc.document_type_id)
          );
          this.revokeRequiredDocPreview(doc.document_type_description);
          this.uploadedFiles[doc.document_type_description] = file;
          this.registerRequiredDocPreview(doc.document_type_description, file);
        } else {
          this.fileNameList.add(fileName);
          this.registerOptionalPreview(fileName, file);
        }

        // 👉 Aseguramos que todos (requeridos y opcionales) se agreguen al array principal
        this.arrayApplicantAttachment.push(applicantAttach);
        this.requestForm.updateValueAndValidity();

        console.log(
          `${isRequiredDoc ? 'Documento obligatorio' : 'Adjunto opcional'} agregado:`,
          applicantAttach
        );
      } finally {
        this.pendingUploadByName.delete(nameKey);
      }
    };
    reader.readAsDataURL(file);
  }

  this.resetFileInputAfterPick(event);

  // --- Limpiar errores después de 5 segundos ---
  setTimeout(() => {
    this.errorRepeatFile = false;
    this.errorExtensionFile = false;
    this.errorSizeFile = false;
  }, 5000);
}







  getAplicant(): ApplicantAttachments[] {
    return this.arrayApplicantAttachment;
  }

  getOptionalFileByName(fileName: string): File | undefined {
    const item = this.arrayApplicantAttachment.find(
      a =>
        a.source_name === fileName &&
        (a.document_type_id === null || a.document_type_id === undefined)
    );
    return item?.file;
  }

  private resetFileInputAfterPick(event: Event | any): void {
    const el = event?.target as HTMLInputElement | undefined;
    if (el?.type === 'file') {
      el.value = '';
    }
  }

  private fileNameKey(name: string | undefined | null): string {
    return (name ?? '').trim().toLowerCase();
  }

  private sameDocumentTypeId(
    a: number | string | null | undefined,
    b: number | string | null | undefined
  ): boolean {
    return Number(a) === Number(b);
  }

  /**
   * True si ya existe un adjunto con el mismo nombre (lista opcional, obligatorios en memoria y en array).
   * ctx: al reemplazar un obligatorio, se excluye solo ese slot para permitir el mismo control.
   */
  private isFileNameAlreadyAttached(
    fileName: string,
    ctx?: { replaceDocumentTypeId?: number | string | null; replaceDocumentDescription?: string }
  ): boolean {
    const key = this.fileNameKey(fileName);

    for (const listed of this.fileNameList) {
      if (this.fileNameKey(listed) === key) {
        return true;
      }
    }

    if (this.uploadedFiles) {
      for (const [description, f] of Object.entries(this.uploadedFiles)) {
        if (!f?.name) {
          continue;
        }
        if (ctx?.replaceDocumentDescription && description === ctx.replaceDocumentDescription) {
          continue;
        }
        if (this.fileNameKey(f.name) === key) {
          return true;
        }
      }
    }

    return this.arrayApplicantAttachment.some(item => {
      if (!item.source_name || this.fileNameKey(item.source_name) !== key) {
        return false;
      }
      if (
        ctx?.replaceDocumentTypeId != null &&
        item.document_type_id != null &&
        this.sameDocumentTypeId(item.document_type_id, ctx.replaceDocumentTypeId)
      ) {
        return false;
      }
      return true;
    });
  }

  private clearDuplicateFileError(): void {
    if (this.duplicateFileErrorClearHandle != null) {
      clearTimeout(this.duplicateFileErrorClearHandle);
      this.duplicateFileErrorClearHandle = null;
    }
    this.duplicateFileErrorMessage = null;
    this.duplicateFileErrorTarget = null;
    this.changeDetectorRef.detectChanges();
  }

  private notifyDuplicateFileName(fileName: string, target: 'optional' | number | string): void {
    if (this.duplicateFileErrorClearHandle != null) {
      clearTimeout(this.duplicateFileErrorClearHandle);
      this.duplicateFileErrorClearHandle = null;
    }
    this.duplicateFileErrorMessage = `No se puede subir un archivo con el mismo nombre. Ya existe "${fileName}" entre los adjuntos.`;
    this.duplicateFileErrorTarget = target;
    this.changeDetectorRef.detectChanges();
    this.duplicateFileErrorClearHandle = setTimeout(() => {
      this.duplicateFileErrorClearHandle = null;
      this.duplicateFileErrorMessage = null;
      this.duplicateFileErrorTarget = null;
      this.changeDetectorRef.detectChanges();
    }, this.duplicateFileMessageDurationMs);
  }

  /** Quita un adjunto opcional por nombre de archivo (coherente con la tabla de adjuntos). */
  clearOptionalAttachment(fileName: string): void {
    const idx = this.arrayApplicantAttachment.findIndex(
      item =>
        item.source_name === fileName &&
        (item.document_type_id === null || item.document_type_id === undefined)
    );
    if (idx === -1) {
      return;
    }
    this.arrayApplicantAttachment.splice(idx, 1);
    this.fileNameList.delete(fileName);
    this.revokeOptionalPreview(fileName);
    if (this.fileInput?.nativeElement && this.fileNameList.size === 0) {
      this.fileInput.nativeElement.value = '';
    }
    this.requestForm.updateValueAndValidity();
  }

  removeRequiredAttachment(
    doc: { document_type_id: number; document_type_description: string },
    fileInputIndex: number
  ): void {
    delete this.uploadedFiles[doc.document_type_description];
    this.revokeRequiredDocPreview(doc.document_type_description);
    this.arrayApplicantAttachment = this.arrayApplicantAttachment.filter(
      item => !this.sameDocumentTypeId(item.document_type_id, doc.document_type_id)
    );
    const input = document.getElementById(`fileInput-${fileInputIndex}`) as HTMLInputElement | null;
    if (input) {
      input.value = '';
    }
    this.requestForm.updateValueAndValidity();
  }

  openAttachmentPreviewModal(
    file: File | null | undefined,
    objectUrl: string | null | undefined
  ): void {
    if (!file || !objectUrl) {
      return;
    }
    this.previewModalTitle = file.name;
    this.previewModalUrl = objectUrl;
    this.previewModalShowImage = this.isImageFile(file);
    this.previewModalShowPdf = this.isPdfFile(file);
    this.previewModalShowUnsupported = !this.previewModalShowImage && !this.previewModalShowPdf;
    this.previewIframeUrl = this.previewModalShowPdf
      ? this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl)
      : null;
    this.previewDialogVisible = true;
    this.changeDetectorRef.detectChanges();
  }

  onPreviewDialogHide(): void {
    this.previewModalUrl = null;
    this.previewIframeUrl = null;
    this.previewModalTitle = '';
    this.previewModalShowImage = false;
    this.previewModalShowPdf = false;
    this.previewModalShowUnsupported = false;
  }

  openPreviewInNewWindow(): void {
    if (this.previewModalUrl) {
      window.open(this.previewModalUrl, '_blank', 'noopener,noreferrer');
    }
  }

  isImageFile(file: File | null | undefined): boolean {
    return !!file?.type?.startsWith('image/');
  }

  isPdfFile(file: File | null | undefined): boolean {
    return file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf') === true;
  }

  /** Icono según extensión para la tabla de adjuntos opcionales. */
  getAttachmentIconClasses(fileName: string): string {
    const ext = (fileName.split('.').pop() ?? '').toLowerCase();
    const base = 'attachment-table__type-icon pi';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
      return `${base} pi-image attachment-table__type-icon--image`;
    }
    if (ext === 'pdf') {
      return `${base} pi-file-pdf attachment-table__type-icon--pdf`;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return `${base} pi-file-excel attachment-table__type-icon--sheet`;
    }
    if (['doc', 'docx'].includes(ext)) {
      return `${base} pi-file-word attachment-table__type-icon--doc`;
    }
    return `${base} pi-file attachment-table__type-icon--default`;
  }

  private registerRequiredDocPreview(docDescription: string, file: File): void {
    this.revokeRequiredDocPreview(docDescription);
    this.requiredDocPreviewUrls[docDescription] = URL.createObjectURL(file);
  }

  private registerOptionalPreview(fileName: string, file: File): void {
    this.revokeOptionalPreview(fileName);
    this.optionalAttachmentPreviews[fileName] = URL.createObjectURL(file);
  }

  private revokeRequiredDocPreview(docDescription: string): void {
    const url = this.requiredDocPreviewUrls[docDescription];
    if (url) {
      URL.revokeObjectURL(url);
    }
    delete this.requiredDocPreviewUrls[docDescription];
  }

  private revokeOptionalPreview(fileName: string): void {
    const url = this.optionalAttachmentPreviews[fileName];
    if (url) {
      URL.revokeObjectURL(url);
    }
    delete this.optionalAttachmentPreviews[fileName];
  }

  private revokeAllPreviewUrls(): void {
    Object.keys(this.requiredDocPreviewUrls).forEach(key => this.revokeRequiredDocPreview(key));
    Object.keys(this.optionalAttachmentPreviews).forEach(key => this.revokeOptionalPreview(key));
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
  // async setParameter(inputValue: RequestFormList) {
  //   const mensaje = inputValue.request_description;
  //   inputValue.count_attacments = this.getAplicant().length;

  //   // Si es necesario adjuntar archivo y no hay aplicantes
  //   if (this.getAplicant().length == 0) {
  //     const adjuntarArchivo = await this.validarMensaje(mensaje);

  //     if (adjuntarArchivo) {
  //       const continuar = await this.showAdjuntarArchivoModal(); // Espera la acción del usuario en el modal
  //       console.log(continuar);
  //       if (!continuar) {
  //         // Si el usuario canceló, no continuar con la creación de la solicitud
  //         return;
  //       } else {
  //         this.continuarCreacionSolicitud(inputValue);
  //       }
  //     } else {
  //       this.continuarCreacionSolicitud(inputValue);
  //     }
  //   } else {
  //     // Continúa con la creación de la solicitud
  //     this.continuarCreacionSolicitud(inputValue);
  //   }
  // }
  async setParameter(inputValue: RequestFormList) {
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

  continuarCreacionSolicitud(inputValue: RequestFormList) {
    this.userService.createRequest(inputValue).subscribe({
      next: (response: BodyResponse<number>) => {
        if (response.code === 200) {
          //this.requestForm.reset();
          //this.fileNameList.clear();
          if (this.getAplicant().length == 0) {
            setTimeout(() => {
              this.showAlertModal(response.data);
            }, 1000);
          } else {
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

  // setParameter(inputValue: RequestFormList) {
  //   this.userService.createRequest(inputValue).subscribe({
  //     next: (response: BodyResponse<number>) => {
  //       if (response.code === 200) {
  //         this.requestForm.reset();
  //         this.fileNameList.clear();
  //         if (this.getAplicant().length == 0) {
  //           setTimeout(() => {
  //             this.showAlertModal(response.data);
  //           }, 1000);
  //         } else {
  //           this.attachApplicantFiles(response.data);
  //         }
  //       } else {
  //         setTimeout(() => {
  //           this.showSuccessMessage('error', 'Fallida', 'Operación fallida!');
  //         }, 1000);
  //       }
  //     },
  //     error: (err: any) => {
  //       console.log(err);
  //     },
  //     complete: () => {
  //       console.log('La suscripción ha sido completada post.');
  //     },
  //   });
  // }
  /*
  async getPreSignedUrl(file: ApplicantAttachments, request_id: number) {
    const payload = {
      source_name: file['source_name'],
      fileweight: file['fileweight'],
      request_id: request_id,
    };
    this.userService.getUrlSigned(payload, 'applicant').subscribe({
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
  */

  /*
  async getPreSignedUrl(file: ApplicantAttachments, request_id: number): Promise<string | void> {
    this.isSpinnerVisible = true;
    const payload = {
      // Ajuste para eliminar lo puntos o caracteres especiales en los nombres de los adjuntos
      source_name: file['source_name'].replace(/(?!\.[^.]+$)\./g, '_'),
      fileweight: file['fileweight'],
      request_id: request_id,
    };

    return new Promise((resolve, reject) => {
      this.userService.getUrlSigned(payload, 'applicant').subscribe({
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
          const response = await firstValueFrom(this.userService.getUrlSigned(payload, 'applicant'));

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
          idSolicitud: `${request_id}`,
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

  //MEJORA SPINNER CON %
  /*
  async attachApplicantFiles(request_id: number) {
    this.isSpinnerVisible = true;
    this.hasPendingChanges = true;
    this.uploadProgress = 0; // Inicializar la barra de progreso

    try {
        if (this.arrayApplicantAttachment && this.arrayApplicantAttachment.length > 0) {
            const ruta_archivo_ws = environment.ruta_archivos_ws;

            const estructura = {
                idSolicitud: `${request_id}`,
                archivos: this.arrayApplicantAttachment.map(file => ({
                    base64file: file.base64file,
                    source_name: file.source_name,
                    fileweight: file.fileweight,
                })),
            };

            // Envia archivos al servidor (50% del progreso total)
            await this.envioArchivosServer(ruta_archivo_ws, estructura);
        }

        const totalFiles = this.arrayApplicantAttachment.length;
        let uploadedFiles = 0;

        // Subir archivos con seguimiento de progreso (50% restante)
        for (const item of this.arrayApplicantAttachment) {
            await this.getPreSignedUrl(item, request_id);
            await this.uploadToPresignedUrl(item, request_id);

            uploadedFiles++;
            this.uploadProgress = 50 + Math.round((uploadedFiles / totalFiles) * 50);
            this.changeDetectorRef.detectChanges();
        }

        this.uploadProgress = 100;
        this.changeDetectorRef.detectChanges();

        // Limpieza y finalización
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
            this.uploadProgress = 0; // Reiniciar el progreso
        }, 500);
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
      this.revokeAllPreviewUrls();
      this.uploadedFiles = {};
      this.arrayApplicantAttachment = [];
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


  sendRequest() {
    const payload: RequestFormList = {
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
      //data_treatment: true,
      data_treatment: this.authorize_data,
      applicant_attachments: null,
      assigned_attachments: null,
      form_id: this.requestType.form_id,
      count_attacments: 0,
    };

    console.log("PAYLOAD-------: ", payload);
    this.setParameter(payload);
  }
  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAction = value;
    this.router.navigate([RoutesApp.CREATE_REQUEST]);
    localStorage.removeItem('visitedFirstPage');
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

  validateAttachments(formGroup: AbstractControl): ValidationErrors | null {
  const hasRequiredDocs = this.requiredDocuments?.length > 0;

  //Si hay documentos obligatorios → todos deben estar adjuntos
  if (hasRequiredDocs) {
    const allUploaded = this.requiredDocuments.every(
      (doc) => this.uploadedFiles && this.uploadedFiles[doc.document_type_description]
    );

    if (!allUploaded) {
      return { missingAttachments: true }; //faltan adjuntos obligatorios
    }
  }

  return null;
}




}
