import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountTypeList, AssociateBankAccountList, BankList, CategoryList, DepartmentList, ModalityList, MunicipalityList } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';


@Component({
  selector: 'app-modal-bank-account-association',
  templateUrl: './modal-bank-account-association.component.html',
  styleUrl: './modal-bank-account-association.component.scss'
})
export class ModalBankAccountAssociationComponent {
 @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() associateBankAccountForm?: AssociateBankAccountList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<AssociateBankAccountList>();

  inputValue: string[] = [''];

  associateBankAccountList!: AssociateBankAccountList[];
  accountTypeList!: AccountTypeList[];
  bankList!: BankList[];

  //formGroup: FormGroup;

  constructor(
    private userService: Users,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = new FormGroup({
      id: new FormControl(null), 
      id_entidad: new FormControl(null, [Validators.required]),
      id_tipo_cuenta: new FormControl(null, [Validators.required]),
      
       //requerido + numérico + rango 1..20
      longitud_cuenta: new FormControl<number | null>(null, [Validators.required,Validators.pattern('^[0-9]{1,2}$'),
        Validators.min(1),Validators.max(20),]),

      //texto libre con límite
      observacion: new FormControl<string | null>(null, [Validators.maxLength(100),
        Validators.pattern('^[^#$%&]*$')]),
    });
  }
  ngOnInit(): void {
    this.getBankTable();
    this.getAccountTypeTable();

    if (this.buttonmsg !== 'Crear' && this.associateBankAccountForm) {
      this.formGroup.patchValue(this.associateBankAccountForm);
    } else {
      this.formGroup.reset();
    }
  }

  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  getBankTable() {
    this.userService.getBankList().subscribe({
      next: (response: BodyResponse<BankList[]>) => {
        if (response.code === 200) {
          this.bankList = response.data.filter(obj => obj.esta_activa !== false);
        } else {
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

  getAccountTypeTable() {
    this.userService.getAccountTypeList().subscribe({
      next: (response: BodyResponse<AccountTypeList[]>) => {
        if (response.code === 200) {
          this.accountTypeList = response.data.filter(obj => obj.esta_activo !== false);
        } else {
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

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    const payload: AssociateBankAccountList = {
      id: this.formGroup.controls['id'].value,
      id_entidad: this.formGroup.controls['id_entidad'].value,
      id_tipo_cuenta: this.formGroup.controls['id_tipo_cuenta'].value,
      longitud_cuenta: this.formGroup.controls['longitud_cuenta'].value,
      observacion: this.formGroup.controls['observacion'].value,
    };
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }
}
