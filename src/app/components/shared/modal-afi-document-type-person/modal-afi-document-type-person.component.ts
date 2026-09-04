import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DocumentTypePersonList } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';

@Component({
  selector: 'app-modal-afi-document-type-person',
  templateUrl: './modal-afi-document-type-person.component.html',
  styleUrl: './modal-afi-document-type-person.component.scss'
})
export class ModalAfiDocumentTypePersonComponent {
  @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() DocumentTypePersonForm?: DocumentTypePersonList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<DocumentTypePersonList>();

  inputValue: string[] = [''];
  DocumentTypePersonList!: DocumentTypePersonList[];

  constructor(
    private userService: Users,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = new FormGroup({
      id: new FormControl(null),
      tipo_documento: new FormControl(null, [Validators.required]),
      tipo_documento_genesys: new FormControl(null, [Validators.required]),
      digitos_minimos: new FormControl(null, [Validators.required]),
      digitos_maximos: new FormControl(null, [Validators.required]),
      permite_letras: new FormControl(null, [Validators.required]),
      cantidad_letras: new FormControl<number | null>(null, [Validators.pattern('^[0-9]+$')]),
      requiere_adjunto: new FormControl<'S' | 'N' | null>(null, [Validators.required]),

    });
  }
 ngOnInit(): void {
    if (this.buttonmsg !== 'Crear' && this.DocumentTypePersonForm) {

      const requiereAdjunto = this.normalizeRequerido(this.DocumentTypePersonForm.requiere_adjunto);
      const permiteLetras = this.normalizeRequerido(this.DocumentTypePersonForm.permite_letras);

      this.formGroup.patchValue({
      id: this.DocumentTypePersonForm.id ?? null,
      tipo_documento: this.DocumentTypePersonForm.tipo_documento ?? null,
      tipo_documento_genesys: this.DocumentTypePersonForm.tipo_documento_genesys ?? null,
      digitos_minimos: this.DocumentTypePersonForm.digitos_minimos ?? null,
      digitos_maximos: this.DocumentTypePersonForm.digitos_maximos ?? null,
      permite_letras: permiteLetras,
      cantidad_letras: this.DocumentTypePersonForm.cantidad_letras ?? null,
      requiere_adjunto: requiereAdjunto,
      
    }); 

    } else {
      this.formGroup.reset();
    }

    this.formGroup.get('tipo_documento')?.addValidators(Validators.pattern('^[^#$%&]+$'));
    this.formGroup.get('tipo_documento_genesys')?.addValidators(Validators.pattern('^[^#$%&]+$'));
    this.formGroup.get('digitos_minimos')?.addValidators(Validators.pattern('^[0-9]+$'));
    this.formGroup.get('digitos_maximos')?.addValidators(Validators.pattern('^[0-9]+$'));
    this.formGroup.get('cantidad_letras')?.addValidators(Validators.pattern('^[0-9]+$'));

    this.applyCantidadLetrasRule(this.formGroup.get('permite_letras')?.value);
    this.formGroup.get('permite_letras')?.valueChanges.subscribe(value => {
      this.applyCantidadLetrasRule(value);
    });
  }


  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);

    const raw = this.formGroup.getRawValue();
    const cantidadLetrasFinal = raw.permite_letras === 'S' ? raw.cantidad_letras : null;
    
    const payload: DocumentTypePersonList = {
      id: raw.id,
      tipo_documento: raw.tipo_documento,
      tipo_documento_genesys: raw.tipo_documento_genesys,
      digitos_minimos: raw.digitos_minimos,
      digitos_maximos: raw.digitos_maximos,
      permite_letras: raw.permite_letras,
      cantidad_letras: cantidadLetrasFinal,
      requiere_adjunto: raw.requiere_adjunto,
    };
    
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }

  private normalizeRequerido(value: any): 'S' | 'N' | null {
    if (value === null || value === undefined) return null;

    if (typeof value === 'boolean') return value ? 'S' : 'N';

    if (typeof value === 'number') return value === 1 ? 'S' : 'N';

    const v = String(value).trim().toUpperCase();
    if (['S', 'SI', 'TRUE', '1', 'T', 'Y', 'YES'].includes(v)) return 'S';
    if (['N', 'NO', 'FALSE', '0', 'F'].includes(v)) return 'N';

    return null;
  }

private applyCantidadLetrasRule(permite: 'S' | 'N' | null): void {
  const ctrl = this.formGroup.get('cantidad_letras');
  if (!ctrl) return;

  if (permite === 'S') {
    ctrl.enable({ emitEvent: false });
    ctrl.setValidators([Validators.required, Validators.pattern('^[0-9]+$')]);
  } else {
    ctrl.setValidators([Validators.pattern('^[0-9]+$')]);
    ctrl.disable({ emitEvent: false });
  }

  ctrl.updateValueAndValidity({ emitEvent: false });
}
}
