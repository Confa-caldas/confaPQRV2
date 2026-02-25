import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AfiTemplateValidationList, DocumentTypeCompanyList } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';

@Component({
  selector: 'app-modal-document-type',
  templateUrl: './modal-document-type.component.html',
  styleUrl: './modal-document-type.component.scss'
})
export class ModalDocumentTypeComponent {
@Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() DocumentTypeCompanyForm?: DocumentTypeCompanyList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<DocumentTypeCompanyList>();

  inputValue: string[] = [''];
  DocumentTypeComponenLis!: DocumentTypeCompanyList[];

  //formGroup: FormGroup;

  constructor(
    private userService: Users,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = new FormGroup({
      id: new FormControl(null),
      tipo_documento: new FormControl(null, [Validators.required]),
      tipo_documento_genesys: new FormControl(null, [Validators.required]),
      codigo_verificacion: new FormControl<'S' | 'N' | null>(null, [Validators.required]),
      digitos_minimos: new FormControl(null, [Validators.required]),
      digitos_maximos: new FormControl(null, [Validators.required]),
      permite_letras: new FormControl(null, [Validators.required]),
      
       //SIN required aquí, porque será condicional
      cantidad_letras: new FormControl<number | null>(null, [Validators.pattern('^[0-9]+$')]),
    });
  }
 ngOnInit(): void {
    if (this.buttonmsg !== 'Crear' && this.DocumentTypeCompanyForm) {

      const codigoVerificacion = this.normalizeRequerido(this.DocumentTypeCompanyForm.codigo_verificacion);
      const permiteLetras = this.normalizeRequerido(this.DocumentTypeCompanyForm.permite_letras);

      this.formGroup.patchValue({
      id: this.DocumentTypeCompanyForm.id ?? null,
      tipo_documento: this.DocumentTypeCompanyForm.tipo_documento ?? null,
      tipo_documento_genesys: this.DocumentTypeCompanyForm.tipo_documento_genesys ?? null,
      codigo_verificacion: codigoVerificacion,
      digitos_minimos: this.DocumentTypeCompanyForm.digitos_minimos ?? null,
      digitos_maximos: this.DocumentTypeCompanyForm.digitos_maximos ?? null,
      permite_letras: permiteLetras,
      cantidad_letras: this.DocumentTypeCompanyForm.cantidad_letras ?? null,
      
    }); 

    } else {
      this.formGroup.reset();
    }

    this.formGroup.get('tipo_documento')?.addValidators(Validators.pattern('^[^#$%&]+$'));
    this.formGroup.get('tipo_documento_genesys')?.addValidators(Validators.pattern('^[^#$%&]+$'));
    this.formGroup.get('digitos_minimos')?.addValidators(Validators.pattern('^[0-9]+$'));
    this.formGroup.get('digitos_maximos')?.addValidators(Validators.pattern('^[0-9]+$'));
    this.formGroup.get('cantidad_letras')?.addValidators(Validators.pattern('^[0-9]+$'));

    //aplica regla inicial
    this.applyCantidadLetrasRule(this.formGroup.get('permite_letras')?.value);
    // escucha cambios
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
    
    const payload: DocumentTypeCompanyList = {
      id: raw.id,
      tipo_documento: raw.tipo_documento,
      tipo_documento_genesys: raw.tipo_documento_genesys,
      codigo_verificacion: raw.codigo_verificacion,
      digitos_minimos: raw.digitos_minimos,
      digitos_maximos: raw.digitos_maximos,
      permite_letras: raw.permite_letras,
      cantidad_letras: cantidadLetrasFinal,
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

private applyCantidadLetrasRule(permite: 'S' | 'N' | null): void {
  const ctrl = this.formGroup.get('cantidad_letras');
  if (!ctrl) return;

  if (permite === 'S') {
    ctrl.enable({ emitEvent: false });
    ctrl.setValidators([Validators.required, Validators.pattern('^[0-9]+$')]);
  } else {
    // 👇 NO BORRAR el valor
    ctrl.setValidators([Validators.pattern('^[0-9]+$')]); // requerido NO
    ctrl.disable({ emitEvent: false }); // opcional: si quieres que no lo editen
  }

  ctrl.updateValueAndValidity({ emitEvent: false });
}


}
