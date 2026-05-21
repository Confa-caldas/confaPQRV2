import { Component, ElementRef, OnInit, OnDestroy, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators, FormArray, FormControl, ValidationErrors } from '@angular/forms';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import {
  ApplicantAttachments,
  ApplicantTypeList,
  RequestFormListInternal,
  RequestTypeList,
  ErrorAttachLog,
  ProcessRequest
} from '../../../models/users.interface';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { RoutesApp } from '../../../enums/routes.enum';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { HttpEventType, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { throwError, retry, lastValueFrom, firstValueFrom } from 'rxjs';
import { catchError, retryWhen, delay, take, tap, filter } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CheckboxChangeEvent } from 'primeng/checkbox';

@Component({
  selector: 'app-request-form-internal',
  templateUrl: './request-form-internal.component.html',
  styleUrl: './request-form-internal.component.scss',
})
export class RequestFormInternalComponent implements OnInit, OnDestroy {
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
  currentUploadFileName = '';
  currentUploadIndex = 0;
  totalUploadCount = 0;

  private readonly serverProgressWeight = 35;
  private readonly s3ProgressWeight = 65;

  useIaAttach: boolean = false;
  authorize_data: boolean = false;

  opciones = ['correo', 'sms'];

  minError: string = '';
  maxError: string = '';
  requiredDocuments: { document_type_id: number; document_type_description: string }[] = [];
  uploadedFiles: { [key: string]: File } = {};
  requiredDocPreviewUrls: { [key: string]: string } = {};
  optionalAttachmentPreviews: { [key: string]: string } = {};
  private pendingUploadByName = new Set<string>();
  duplicateFileErrorMessage: string | null = null;
  duplicateFileErrorTarget: 'optional' | number | string | null = null;
  private duplicateFileErrorClearHandle: ReturnType<typeof setTimeout> | null = null;
  private readonly duplicateFileMessageDurationMs = 4000;
  previewDialogVisible = false;
  previewModalTitle = '';
  previewModalUrl: string | null = null;
  previewIframeUrl: SafeResourceUrl | null = null;
  previewModalShowImage = false;
  previewModalShowPdf = false;
  previewModalShowUnsupported = false;

  ngOnInit(): void {
    let applicant = localStorage.getItem('applicant-type');
    let request = localStorage.getItem('request-type');
    const visitedFirstPage = localStorage.getItem('visitedFirstPage');
    const authorize_data_raw = localStorage.getItem('authorize_data');
    this.authorize_data = authorize_data_raw ? JSON.parse(authorize_data_raw) : null;

    const storedDocs = localStorage.getItem('requiredDocuments');
    this.requiredDocuments = storedDocs ? JSON.parse(storedDocs) : [];

    console.log(visitedFirstPage);

    if (!visitedFirstPage) {
      this.router.navigate([RoutesApp.CREATE_REQUEST_INTERNAL]);
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

    this.opciones = ['correo', 'sms']; // Opciones dinámicas

    const contactosGroup = this.formBuilder.group({}, { validators: this.validateAtLeastOneSelected });
    this.opciones.forEach(opcion => {
      contactosGroup.addControl(opcion, new FormControl(false)); // Inicializa en false
    });

    this.requestForm = this.formBuilder.group(
      {
        document_type: ['', Validators.required],
        number_id: ['', Validators.required],
        name: ['', [Validators.pattern('^[^@#$%&]+$')]],

        cellphone: ['', [Validators.pattern('^[0-9]{10}$')]],
        validator_cellphone: ['', [Validators.pattern('^[0-9]{10}$')]],
        email: [
          '',
          [
            
            Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
          ],
        ],
        validator_email: [''],
        mensage: ['', [Validators.required, Validators.maxLength(1000)]],

        //contactos: this.formBuilder.group({}, { validators: this.validateAtLeastOneSelected }) // Contendrá los campos dinámicos
        contactos: contactosGroup,
        sms: [''],
        //llamada: [''],
        correo: ['']
      },
      { validators: [this.cellphoneMatcher, this.emailMatcher, this.validateAttachments.bind(this)] }
    );

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
  

  
    toggleCampo(event: CheckboxChangeEvent, tipo: string) {
      const checked = event.checked;
      const contactos = this.requestForm.get('contactos') as FormGroup;
    
      // Asegurar que el control existe y actualizar su valor
      if (!contactos.get(tipo)) {
        contactos.addControl(tipo, new FormControl(false)); // Si no existe, agrégalo
      }
      contactos.get(tipo)?.setValue(checked);
    
      console.log('Estado actual de los checkboxes:', this.requestForm.get('contactos')?.value);
    
      if (checked) {
        // Agregar validaciones cuando se marca
        if (tipo === 'sms') {
          this.requestForm.get('numWhatsapp')?.setValidators([
            Validators.required,
            Validators.pattern('^[0-9]{10}$'),
          ]);
        } else if (tipo === 'llamada') {
          this.requestForm.get('cellphone')?.setValidators([
            Validators.required,
            Validators.pattern('^[0-9]{10}$'),
          ]);
        } else if (tipo === 'correo') {
          this.requestForm.get('email')?.setValidators([
            Validators.required,
            Validators.email,
            Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
          ]);
          this.requestForm.get('validator_email')?.setValidators([Validators.required]);
        }
      } else {
        // Cuando se desmarca, limpiar el campo pero sin eliminarlo
        if (tipo === 'sms') {
          this.requestForm.get('numWhatsapp')?.reset();
          this.requestForm.get('numWhatsapp')?.clearValidators();
        } else if (tipo === 'llamada') {
          this.requestForm.get('cellphone')?.reset();
          this.requestForm.get('cellphone')?.clearValidators();
        } else if (tipo === 'correo') {
          //this.requestForm.get('email')?.reset();
          this.requestForm.get('email')?.clearValidators();
          //this.requestForm.get('validator_email')?.reset();
          this.requestForm.get('validator_email')?.clearValidators();
        }
      }
    
      // Aplicar cambios de validaciones
      this.requestForm.get('numWhatsapp')?.updateValueAndValidity();
      this.requestForm.get('cellphone')?.updateValueAndValidity();
      this.requestForm.get('email')?.updateValueAndValidity();
      this.requestForm.get('validator_email')?.updateValueAndValidity();
    }
    

  validateAtLeastOneSelected(group: FormGroup) {
    const values = Object.values(group.value);
    const atLeastOneSelected = values.some(value => value === true);
  
    return atLeastOneSelected ? null : { atLeastOneRequired: true };
  }

  estaSeleccionado(tipo: string): boolean {
    return this.requestForm.get(`contactos.${tipo}`)?.value === true;
  }
  

  getControl(tipo: string): FormControl {
    return this.requestForm.get('contactos.' + tipo) as FormControl;
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

  cellphoneMatcher: ValidatorFn = (formGroup: AbstractControl) => {
    const cellphone = formGroup.get('cellphone')?.value;
    const cellphoneConfirmed = formGroup.get('validator_cellphone')?.value;
    return cellphone === cellphoneConfirmed ? null : { cellphoneNotMatched: true };
  };

  openFileInput() {
    this.fileInput.nativeElement.value = ''; // Limpiar la entrada de archivos antes de abrir el cuadro de diálogo
    this.fileInput.nativeElement.click();
  }
  onFileSelected(event: any, doc?: { document_type_id: number; document_type_description: string }) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    const isRequiredDoc = !!doc;
    const duplicateCtx =
      isRequiredDoc && doc
        ? {
            replaceDocumentTypeId: doc.document_type_id,
            replaceDocumentDescription: doc.document_type_description,
          }
        : undefined;
    const duplicateErrorTarget: 'optional' | number | string = isRequiredDoc
      ? doc.document_type_id
      : 'optional';

    if (!isRequiredDoc && this.arrayApplicantAttachment.length === 0) {
      this.fileNameList = new Set<string>();
    }

    for (let i = 0; i < files.length; i++) {
      let file: File = files[i];
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

      const fileName: string = file.name;
      const fileSizeInKiloBytes = file.size / 1024;
      const fileSizeFormat =
        fileSizeInKiloBytes < 1024
          ? `${fileSizeInKiloBytes.toFixed(2)}KB`
          : `${(fileSizeInKiloBytes / 1024).toFixed(2)}MB`;

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
      if (
        this.pendingUploadByName.has(nameKey) ||
        this.isFileNameAlreadyAttached(fileName, duplicateCtx)
      ) {
        this.notifyDuplicateFileName(fileName, duplicateErrorTarget);
        continue;
      }

      this.pendingUploadByName.add(nameKey);
      const reader = new FileReader();
      reader.onerror = () => this.pendingUploadByName.delete(nameKey);
      reader.onload = (e: any) => {
        try {
          if (this.isFileNameAlreadyAttached(fileName, duplicateCtx)) {
            this.notifyDuplicateFileName(fileName, duplicateErrorTarget);
            return;
          }
          this.clearDuplicateFileError();
          const base64String: string = e.target.result.split(',')[1];
          const applicantAttach: ApplicantAttachments = {
            base64file: base64String,
            source_name: fileName,
            fileweight: fileSizeFormat,
            file,
            document_type_id: isRequiredDoc ? doc!.document_type_id : null,
          };

          if (isRequiredDoc) {
            if (!this.uploadedFiles) this.uploadedFiles = {};
            this.arrayApplicantAttachment = this.arrayApplicantAttachment.filter(
              item => !this.sameDocumentTypeId(item.document_type_id, doc!.document_type_id)
            );
            this.revokeRequiredDocPreview(doc!.document_type_description);
            this.uploadedFiles[doc!.document_type_description] = file;
            this.registerRequiredDocPreview(doc!.document_type_description, file);
          } else {
            this.fileNameList.add(fileName);
            this.registerOptionalPreview(fileName, file);
          }

          this.arrayApplicantAttachment.push(applicantAttach);
          this.requestForm.updateValueAndValidity();
        } finally {
          this.pendingUploadByName.delete(nameKey);
        }
      };
      reader.readAsDataURL(file);
    }

    this.resetFileInputAfterPick(event);
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

  private isFileNameAlreadyAttached(
    fileName: string,
    ctx?: { replaceDocumentTypeId?: number | string | null; replaceDocumentDescription?: string }
  ): boolean {
    const key = this.fileNameKey(fileName);
    for (const listed of this.fileNameList) {
      if (this.fileNameKey(listed) === key) return true;
    }
    if (this.uploadedFiles) {
      for (const [description, f] of Object.entries(this.uploadedFiles)) {
        if (!f?.name) continue;
        if (ctx?.replaceDocumentDescription && description === ctx.replaceDocumentDescription) {
          continue;
        }
        if (this.fileNameKey(f.name) === key) return true;
      }
    }
    return this.arrayApplicantAttachment.some(item => {
      if (!item.source_name || this.fileNameKey(item.source_name) !== key) return false;
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

  clearOptionalAttachment(fileName: string): void {
    const idx = this.arrayApplicantAttachment.findIndex(
      item =>
        item.source_name === fileName &&
        (item.document_type_id === null || item.document_type_id === undefined)
    );
    if (idx === -1) return;
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
    if (input) input.value = '';
    this.requestForm.updateValueAndValidity();
  }

  openAttachmentPreviewModal(file: File | null | undefined, objectUrl: string | null | undefined): void {
    if (!file || !objectUrl) return;
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

  getAttachmentIconClasses(fileName: string): string {
    const ext = (fileName.split('.').pop() ?? '').toLowerCase();
    const base = 'attachment-table__type-icon pi';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
      return `${base} pi-image attachment-table__type-icon--image`;
    }
    if (ext === 'pdf') return `${base} pi-file-pdf attachment-table__type-icon--pdf`;
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
    if (url) URL.revokeObjectURL(url);
    delete this.requiredDocPreviewUrls[docDescription];
  }

  private revokeOptionalPreview(fileName: string): void {
    const url = this.optionalAttachmentPreviews[fileName];
    if (url) URL.revokeObjectURL(url);
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

  async setParameter(inputValue: RequestFormListInternal) {
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

  continuarCreacionSolicitud(inputValue: RequestFormListInternal) {
    const hasAttachments = this.getAplicant().length > 0;

    if (hasAttachments) {
      this.isSpinnerVisible = true;
      this.hasPendingChanges = true;
      this.totalUploadCount = this.getAplicant().length;
      this.currentUploadIndex = 0;
      this.currentUploadFileName = 'Registrando solicitud...';
      this.uploadProgress = 2;
      this.changeDetectorRef.detectChanges();
    }

    this.userService.createRequestInternal(inputValue).subscribe({
      next: (response: BodyResponse<number>) => {
        if (response.code === 200) {
          if (!hasAttachments) {
            this.actualizarLogProceso(response.data);
            setTimeout(() => {
              this.showAlertModal(response.data);
            }, 1000);
          } else {
            void this.attachApplicantFiles(response.data);
          }
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

  actualizarLogProceso (request_id: number){
    const transactionId = localStorage.getItem('id-transaction');

    if (!transactionId) {
      console.error('No se encontró un ID de transacción para actualizar el registro.');
      return;
    }

    const payload: ProcessRequest = {
      operation: 'update',
      transaction_id: transactionId,
      status: "Finalizado",
      request_id: request_id,
      validation_attachemens: this.useIaAttach,
    };

    console.log(payload);

    this.userService.registerProcessRequest(payload).subscribe({
      next: (response: BodyResponse<string>) => {
        if (response.code === 200){
          localStorage.removeItem('id-transaction');
          console.log('Actualizacion exitoso en log de proceso de solicitud');
          console.log('ID de transacción eliminado del LocalStorage.');
        }else{
          console.log('Error actualizando en log de proceso de solicitud');
        }
      },
      error: (err) => {
        console.error('Error consumiendo el servicio de registro request:', err);
      },
    })
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


  private setCurrentUploadFile(
    fileName: string,
    index: number,
    total: number,
    progress?: number,
    phase?: 'server' | 's3'
  ): void {
    this.currentUploadFileName = fileName;
    this.currentUploadIndex = index;
    this.totalUploadCount = total;
    if (progress != null && phase) {
      this.updateUploadProgress(index - 1, total, progress, phase);
    } else {
      this.changeDetectorRef.detectChanges();
    }
  }

  private updateUploadProgress(
    fileIndex: number,
    totalFiles: number,
    filePercent: number,
    phase: 'server' | 's3'
  ): void {
    if (totalFiles <= 0) return;

    if (phase === 'server') {
      this.uploadProgress = Math.round(((fileIndex + 1) / totalFiles) * this.serverProgressWeight);
    } else {
      const base = (fileIndex / totalFiles) * this.s3ProgressWeight;
      const slice = this.s3ProgressWeight / totalFiles;
      this.uploadProgress = Math.round(
        this.serverProgressWeight + base + (filePercent / 100) * slice
      );
    }

    this.uploadProgress = Math.min(this.uploadProgress, 99);
    this.changeDetectorRef.detectChanges();
  }

  private endAttachmentUploadUi(): void {
    setTimeout(() => {
      this.isSpinnerVisible = false;
      this.hasPendingChanges = false;
      this.uploadProgress = 0;
      this.currentUploadFileName = '';
      this.currentUploadIndex = 0;
      this.totalUploadCount = 0;
      this.changeDetectorRef.detectChanges();
    }, 500);
  }

  //MEJORA 2025
  async getPreSignedUrl(file: ApplicantAttachments, request_id: number): Promise<string> {
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


  async uploadToPresignedUrl(
    file: ApplicantAttachments,
    request_id: number,
    fileIndex: number,
    totalFiles: number
  ): Promise<void> {
    if (!file?.file) {
      throw new Error('El archivo no es válido o está indefinido.');
    }
    if (!file.preSignedUrl) {
      throw new Error(`No se encontró una URL prefirmada para el archivo: ${file.source_name}`);
    }

    const contentType = file.file.type || 'application/octet-stream';
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 2000;

    const upload$ = this.http
      .put(file.preSignedUrl, file.file, {
        headers: { 'Content-Type': contentType },
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        tap(event => {
          if (event.type === HttpEventType.UploadProgress) {
            const total = event.total || file.file?.size || 1;
            const filePct = Math.round((event.loaded / total) * 100);
            this.updateUploadProgress(fileIndex, totalFiles, filePct, 's3');
          }
        }),
        retryWhen(errors =>
          errors.pipe(
            tap((error: HttpErrorResponse) => {
              const errorDetails = {
                status: error.status,
                statusText: error.statusText,
                message: error.message,
                url: error.url,
              };
              if (![500, 502, 503, 504, 429].includes(error.status)) {
                throw error;
              }
              this.handleUploadFailure(file, request_id, errorDetails);
            }),
            delay(RETRY_DELAY_MS),
            take(MAX_RETRIES),
            catchError(err => throwError(() => err))
          )
        ),
        filter((event): event is HttpResponse<Object> => event instanceof HttpResponse)
      );

    await lastValueFrom(upload$);
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


async attachApplicantFiles(request_id: number) {
  const attachments = [...this.arrayApplicantAttachment];

  if (!attachments.length) {
    console.warn('No hay archivos para subir.');
    return;
  }

  const totalFiles = attachments.length;
  const ruta_archivo_ws = environment.ruta_archivos_ws;

  this.isSpinnerVisible = true;
  this.hasPendingChanges = true;
  this.uploadProgress = 0;
  this.totalUploadCount = totalFiles;
  this.currentUploadIndex = 0;
  this.currentUploadFileName = '';
  this.changeDetectorRef.detectChanges();

  try {
    const estructura = {
      idSolicitud: `${request_id}`,
      archivos: attachments.map(file => ({
        base64file: file.base64file,
        source_name: file.source_name,
        fileweight: file.fileweight,
      })),
    };

    await this.envioArchivosServer(ruta_archivo_ws, estructura, totalFiles);

    const failedFiles: string[] = [];

    for (let index = 0; index < attachments.length; index++) {
      const item = attachments[index];
      this.setCurrentUploadFile(item.source_name, index + 1, totalFiles);

      let s3UploadSucceeded = false;

      try {
        const preSignedUrl = await this.retry(
          () => this.getPreSignedUrl(item, request_id),
          3,
          2000
        );
        item.preSignedUrl = preSignedUrl;

        await this.retry(
          () => this.uploadToPresignedUrl(item, request_id, index, totalFiles),
          3,
          3000
        );
        s3UploadSucceeded = true;
      } catch (s3Error) {
        console.error(`Subida S3 falló para ${item.source_name}:`, s3Error);

        if (this.canUploadViaSdk(item)) {
          try {
            await this.retry(() => this.uploadViaLambda(item, request_id), 3, 3000);
            s3UploadSucceeded = true;
            console.warn(`Subida SDK usada como respaldo para ${item.source_name}.`);
          } catch (sdkError) {
            console.error(`Respaldo SDK falló para ${item.source_name}:`, sdkError);
          }
        } else {
          console.warn(
            `Sin respaldo SDK para ${item.source_name}: el payload supera el límite de API Gateway (~10 MB).`
          );
        }
      }

      if (s3UploadSucceeded) {
        this.updateUploadProgress(index, totalFiles, 100, 's3');
      } else {
        failedFiles.push(item.source_name);
      }
    }

    this.uploadProgress = 100;
    this.changeDetectorRef.detectChanges();

    if (failedFiles.length > 0) {
      this.actualizarLogProceso(request_id);
      this.endAttachmentUploadUi();
      this.showAlertModalError(request_id);
      return;
    }

    this.actualizarLogProceso(request_id);
    this.requestForm.reset();
    this.fileNameList.clear();
    this.revokeAllPreviewUrls();
    this.uploadedFiles = {};
    this.arrayApplicantAttachment = [];

    setTimeout(() => {
      this.endAttachmentUploadUi();
      this.showAlertModal(request_id);
    }, 400);
  } catch (error) {
    console.error('Error durante el proceso de carga:', error);
    this.endAttachmentUploadUi();
    this.showAlertModalError(request_id);
  }
}

/** Límite REST de API Gateway (~10 MB). Margen para metadatos JSON. */
private static readonly API_GATEWAY_MAX_PAYLOAD_BYTES = 10 * 1024 * 1024;
private static readonly API_GATEWAY_PAYLOAD_MARGIN_BYTES = 256 * 1024;

private estimateSdkPayloadBytes(file: ApplicantAttachments): number {
  const base64Len = file.base64file?.length ?? 0;
  const metadataOverhead = 200 + (file.source_name?.length ?? 0) * 2;
  return base64Len + metadataOverhead;
}

private canUploadViaSdk(file: ApplicantAttachments): boolean {
  if (!file.base64file) {
    return false;
  }
  const maxAllowed =
    RequestFormInternalComponent.API_GATEWAY_MAX_PAYLOAD_BYTES -
    RequestFormInternalComponent.API_GATEWAY_PAYLOAD_MARGIN_BYTES;
  const estimated = this.estimateSdkPayloadBytes(file);
  if (estimated > maxAllowed) {
    const mb = (estimated / (1024 * 1024)).toFixed(2);
    console.warn(
      `Omitiendo attachments/sdk para ${file.source_name}: payload estimado ~${mb} MB supera el límite de API Gateway.`
    );
    return false;
  }
  return true;
}

private isSdkUploadResponseOk(response: unknown): boolean {
  if (!response || typeof response !== 'object') return true;
  const body = response as Record<string, unknown>;
  const code = body['code'] ?? body['statusCode'];
  if (code == null) return true;
  return Number(code) === 200;
}

async uploadViaLambda(file: ApplicantAttachments, request_id: number): Promise<void> {
  const payload = {
    file: file.base64file,
    filename: file.source_name,
    source_name: file.source_name,
    request_id: request_id,
  };

  const response = await firstValueFrom(this.userService.uploadPostSdk(payload));

  if (!this.isSdkUploadResponseOk(response)) {
    const body = response as unknown as Record<string, unknown>;
    const code = body['code'] ?? body['statusCode'];
    throw new Error(
      `La subida alternativa a S3 falló para ${file.source_name} (código ${code}).`
    );
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
  async envioArchivosServer(
    ruta_archivo_ws: string,
    estructura: {
      idSolicitud: string;
      archivos: { base64file: string; source_name: string; fileweight: string }[];
    },
    totalArchivos: number
  ): Promise<void> {
    const archivos = estructura.archivos;

    for (let i = 0; i < archivos.length; i++) {
      const archivo = archivos[i];
      this.setCurrentUploadFile(archivo.source_name, i + 1, totalArchivos, 0, 'server');

      await firstValueFrom(
        this.http.post(ruta_archivo_ws, { ...estructura, archivos: [archivo] })
      );

      this.updateUploadProgress(i, totalArchivos, 100, 'server');
    }
  }


  sendRequest() {

    const contactos = this.requestForm.get('contactos')?.value;

    const payload: RequestFormListInternal = {
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

      check_sms:  contactos.sms,
      check_correo: contactos.correo
    };

    console.log("PAYLOAD internal: ", payload);

    this.setParameter(payload);
  }
  closeDialogAlert(value: boolean) {
    this.visibleDialogAlert = false;
    this.enableAction = value;
    this.router.navigate([RoutesApp.CREATE_REQUEST_INTERNAL]);
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

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
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

    if (hasRequiredDocs) {
      const allUploaded = this.requiredDocuments.every(
        doc => this.uploadedFiles && this.uploadedFiles[doc.document_type_description]
      );

      if (!allUploaded) {
        return { missingAttachments: true };
      }
    }

    return null;
  }
}
