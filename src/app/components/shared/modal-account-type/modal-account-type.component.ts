import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountTypeList, BankList } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';

@Component({
  selector: 'app-modal-account-type',
  templateUrl: './modal-account-type.component.html',
  styleUrl: './modal-account-type.component.scss'
})
export class ModalAccountTypeComponent {
  @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() accountTypeForm?: AccountTypeList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<AccountTypeList>();

  inputValue: string[] = [''];
  accountTypeList!: AccountTypeList[];

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
    const payload: AccountTypeList = {
      id_tipo_cuenta: this.formGroup.controls['id_tipo_cuenta'].value,
      nombre_tipo_cuenta: this.formGroup.controls['nombre_tipo_cuenta'].value,
    };
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }
}
