import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountTypeListAfi } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';

@Component({
  selector: 'app-modal-afiliation-account-type',
  templateUrl: './modal-afiliation-account-type.component.html',
  styleUrl: './modal-afiliation-account-type.component.scss'
})
export class ModalAfiliationAccountTypeComponent {
  @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() accountTypeForm?: AccountTypeListAfi;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<AccountTypeListAfi>();

  inputValue: string[] = [''];
  accountTypeListAfi!: AccountTypeListAfi[];

  // tipo entidad options
  tipoDatoOptions = [
    { label: 'Banco', value: 'Banco' },
    { label: 'Billetera', value: 'Billetera' }
  ];

  constructor(
    private userService: Users,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = new FormGroup({
      id_tipo_cuenta: new FormControl(null), 
      nombre_tipo_cuenta: new FormControl(null, [Validators.required]),
    });
  }
  ngOnInit(): void {
    if (this.buttonmsg !== 'Crear' && this.accountTypeForm) {
      this.formGroup.patchValue(this.accountTypeForm);

    } else {
      this.formGroup.reset();
    }
    this.formGroup.get('nombre_tipo_cuenta')?.addValidators(Validators.pattern('^[^#$%&]+$'));
  }

  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    const payload: AccountTypeListAfi = {
      id_tipo_cuenta: this.formGroup.controls['id_tipo_cuenta'].value,
      nombre_tipo_cuenta: this.formGroup.controls['nombre_tipo_cuenta'].value,
    };
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }
}
