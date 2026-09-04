import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BankList } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';

@Component({
  selector: 'app-modal-bank',
  templateUrl: './modal-bank.component.html',
  styleUrl: './modal-bank.component.scss'
})
export class ModalBankComponent {
 @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() bankForm?: BankList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<BankList>();

  inputValue: string[] = [''];
  bankList!: BankList[];

  // tipo entidad options
  tipoDatoOptions = [
    { label: 'Banco', value: 'Banco' },
    { label: 'Billetera', value: 'Billetera' }
  ];

  //formGroup: FormGroup;

  constructor(
    private userService: Users,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = new FormGroup({
      id_entidad: new FormControl(null), 
      nombre_entidad: new FormControl(null, [Validators.required]),
      tipo_entidad: new FormControl(null, [Validators.required]),
      codigo_entidad: new FormControl(null, [Validators.required]),
    });
  }
  ngOnInit(): void {
    if (this.buttonmsg !== 'Crear' && this.bankForm) {
      this.formGroup.patchValue(this.bankForm);

    } else {
      this.formGroup.reset();
    }
    this.formGroup.get('nombre_entidad')?.addValidators(Validators.pattern('^[^#$%&]+$'));
    this.formGroup.get('tipo_entidad')?.addValidators(Validators.pattern('^[^#$%&]+$'));
    this.formGroup.get('codigo_entidad')?.addValidators(Validators.pattern('^[^#$%&]+$'));
  }

  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    const payload: BankList = {
      id_entidad: this.formGroup.controls['id_entidad'].value,
      nombre_entidad: this.formGroup.controls['nombre_entidad'].value,
      tipo_entidad: this.formGroup.controls['tipo_entidad'].value,
      codigo_entidad: this.formGroup.controls['codigo_entidad'].value,
    };
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }
}
