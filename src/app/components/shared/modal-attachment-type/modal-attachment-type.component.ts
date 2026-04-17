import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AttachmentTypeList } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';

@Component({
  selector: 'app-modal-attachment-type',
  templateUrl: './modal-attachment-type.component.html',
  styleUrl: './modal-attachment-type.component.scss'
})
export class ModalAttachmentTypeComponent {
  @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() AttachmentTypeForm?: AttachmentTypeList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<AttachmentTypeList>();

  inputValue: string[] = [''];
  AttachementTypeList!: AttachmentTypeList[];

  private readonly allowedFormats = [
    'jpg','jpeg','png','pdf','doc','docx','xls','xlsx','ppt','pptx','txt','csv'
  ];

  //formGroup: FormGroup;

  constructor(
    private userService: Users,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = new FormGroup({
      id: new FormControl(null),
      nombre_documento: new FormControl(null, [Validators.required]),
      formatos_permitidos: new FormControl(null, [
        Validators.required,
        this.formatsValidator(this.allowedFormats)
      ]),
      es_requerido: new FormControl<'S' | 'N' | null>(null, [Validators.required]),
    });
  }
 ngOnInit(): void {
    if (this.buttonmsg !== 'Crear' && this.AttachmentTypeForm) {

      const esRequerido = this.normalizeRequerido(this.AttachmentTypeForm.es_requerido);

      this.formGroup.patchValue({
      id: this.AttachmentTypeForm.id ?? null,
      nombre_documento: this.AttachmentTypeForm.nombre_documento ?? null,
      formatos_permitidos: this.AttachmentTypeForm.formatos_permitidos ?? null,
      es_requerido: esRequerido,   
    }); 

    } else {
      this.formGroup.reset();
    }

    //Normaliza en vivo (quita espacios, minúscula)
    this.formGroup.get('formatos_permitidos')?.valueChanges.subscribe(v => {
      const normalized = this.normalizeFormats(v);
      if (v !== normalized) {
        this.formGroup.get('formatos_permitidos')?.setValue(normalized, { emitEvent: false });
      }
    });

    this.formGroup.get('nombre_documento')?.addValidators(Validators.pattern('^[^#$%&]+$'));
  }


  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);

    const raw = this.formGroup.getRawValue();
    
    const payload: AttachmentTypeList = {
      id: raw.id,
      nombre_documento: raw.nombre_documento,
      formatos_permitidos: raw.formatos_permitidos,
      es_requerido: raw.es_requerido,
    };
    
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }

  private normalizeRequerido(value: any): 'S' | 'N' | null {
    if (value === null || value === undefined) return null;

    // Si llega boolean
    if (typeof value === 'boolean') return value ? 'S' : 'N';

    // Si llega number 1/0
    if (typeof value === 'number') return value === 1 ? 'S' : 'N';

    // Si llega string
    const v = String(value).trim().toUpperCase();
    if (['S', 'SI', 'TRUE', '1', 'T', 'Y', 'YES'].includes(v)) return 'S';
    if (['N', 'NO', 'FALSE', '0', 'F'].includes(v)) return 'N';

    return null;
  }

  private normalizeFormats(value: any): string {
    if (!value) return '';
    return String(value)
      .toLowerCase()
      .replace(/\s+/g, '')   // quita espacios
      .replace(/\.+/g, '')   // quita puntos si ponen ".pdf"
      ;
  }
  
 private formatsValidator(allowed: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value;
    if (!raw) return null;

    const value = String(raw)
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/\.+/g, '');

    const parts = value.split(',').map(x => x.trim()).filter(Boolean);
    if (parts.length === 0) return { formatosInvalidos: true };

    const invalidShape = parts.some(ext => !/^[a-z0-9]+$/.test(ext));
    if (invalidShape) return { formatosInvalidos: true };

    const notAllowed = parts.filter(ext => !allowed.includes(ext));
    if (notAllowed.length > 0) return { formatosNoPermitidos: notAllowed };

    return null;
  };
}


}
