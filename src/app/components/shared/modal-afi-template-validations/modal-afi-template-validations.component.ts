import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AfiTemplateValidationList } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';


@Component({
  selector: 'app-modal-afi-template-validations',
  templateUrl: './modal-afi-template-validations.component.html',
  styleUrl: './modal-afi-template-validations.component.scss'
})
export class ModalAfiTemplateValidationsComponent {
 @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() AfiTemplateValidationForm?: AfiTemplateValidationList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<AfiTemplateValidationList>();

  inputValue: string[] = [''];
  AfiTemplateValidationList!: AfiTemplateValidationList[];

  // component.ts
  tipoDatoOptions = [
    { label: 'Texto', value: 'TEXTO' },
    { label: 'Numérico', value: 'NUMERICO' },
    { label: 'Fecha', value: 'FECHA' },
    { label: 'Booleano', value: 'BOOLEANO' },
    { label: 'Lista', value: 'LISTA' }
  ];

  obligatoriedadOptions = [
    { label: 'Sí', value: 'S' },
    { label: 'No', value: 'N' }
  ];


  //formGroup: FormGroup;

  constructor(
    private userService: Users,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = new FormGroup({
      id: new FormControl(null),
      nombre_campo: new FormControl(null, [Validators.required]),
      tipo_dato: new FormControl(null, [Validators.required]),
      longitud_maxima: new FormControl(null, [Validators.required]),
      es_requerido: new FormControl(null, [Validators.required]),
      descripcion: new FormControl(null),
    });
  }
 ngOnInit(): void {
    if (this.buttonmsg !== 'Crear' && this.AfiTemplateValidationForm) {
      const tipoDato = this.normalizeTipoDato(this.AfiTemplateValidationForm.tipo_dato);
      const requerido = this.normalizeRequerido(this.AfiTemplateValidationForm.es_requerido);

      this.formGroup.patchValue({
      id: this.AfiTemplateValidationForm.id ?? null,
      nombre_campo: this.AfiTemplateValidationForm.nombre_campo ?? null,
      tipo_dato: tipoDato,
      longitud_maxima: this.AfiTemplateValidationForm.longitud_maxima ?? null,
      es_requerido: requerido,
      descripcion: this.AfiTemplateValidationForm.descripcion ?? null,
      esta_activo: this.AfiTemplateValidationForm.esta_activo ?? null,
    });

    } else {
      this.formGroup.reset();
    }
    this.formGroup.get('nombre_campo')?.addValidators(Validators.pattern('^[^#$%&]+$'));
    this.formGroup.get('tipo_dato')?.addValidators(Validators.pattern('^[^#$%&]+$'));
    this.formGroup.get('longitud_maxima')?.addValidators(Validators.pattern('^[0-9]+$'));

  }


  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    const payload: AfiTemplateValidationList = {
      id: this.formGroup.controls['id'].value,
      nombre_campo: this.formGroup.controls['nombre_campo'].value,
      tipo_dato: this.formGroup.controls['tipo_dato'].value,
      longitud_maxima: this.formGroup.controls['longitud_maxima'].value,
      es_requerido: this.formGroup.controls['es_requerido'].value,
      descripcion: this.formGroup.controls['descripcion'].value,
    };
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }

  private normalizeTipoDato(value: any): string | null {
    if (!value) return null;

    const v = String(value).trim().toUpperCase();

    const map: Record<string, string> = {
      'TEXTO': 'TEXTO',
      'TEXT': 'TEXTO',
      'TEXTO ': 'TEXTO',
      'NUMERICO': 'NUMERICO',
      'NUMÉRICO': 'NUMERICO',
      'NUMERO': 'NUMERICO',
      'NÚMERO': 'NUMERICO',
      'FECHA': 'FECHA',
      'BOOLEANO': 'BOOLEANO',
      'BOOL': 'BOOLEANO',
      'LISTA': 'LISTA',
  };
    return map[v] ?? v; 
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

}
