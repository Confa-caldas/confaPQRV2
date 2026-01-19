import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AccountTypeList } from '../../../models/users.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


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

  constructor(private formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      account_type_id: ['', [Validators.pattern('^[0-9]+$')]],
      account_type_name: ['', [Validators.required, Validators.pattern('^[^#$%&+-/*]+$')]],
    });
  }

  ngOnInit(): void {
    if (this.buttonmsg != 'Crear' && this.accountTypeForm) {
      // Modo Editar: agregar validación requerida al ID
      this.formGroup.controls['account_type_id'].setValidators([
        Validators.required,
        Validators.pattern('^[0-9]+$')
      ]);
      this.formGroup.patchValue(this.accountTypeForm);
    } else {
      // Modo Crear: remover validación requerida del ID
      this.formGroup.controls['account_type_id'].clearValidators();
      this.formGroup.controls['account_type_id'].setValidators([
        Validators.pattern('^[0-9]+$')
      ]);
      this.formGroup.reset();
    }
    this.formGroup.controls['account_type_id'].updateValueAndValidity();
  }

  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    const payload: any = { account_type_name: this.formGroup.controls['account_type_name'].value };
    if (this.buttonmsg !== 'Crear') {
      payload.account_type_id = this.formGroup.controls['account_type_id'].value;
    }
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }
}
