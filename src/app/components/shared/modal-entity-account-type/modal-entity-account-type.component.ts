import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AccountTypeList,
  EntityList,
  EntityAccountTypeList,
} from '../../../models/users.interface';
import { Users } from '../../../services/users.service';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { BodyResponse } from '../../../models/shared/body-response.inteface';

const ENTITY_ACCOUNT_LENGTH_PATTERN = '^(?:[1-9]|1\\d|20)$';

function minMaxLengthOrderValidator(group: AbstractControl): ValidationErrors | null {
  const minCtrl = group.get('min_length');
  const maxCtrl = group.get('max_length');
  if (!minCtrl || !maxCtrl) return null;
  const minVal = minCtrl.value;
  const maxVal = maxCtrl.value;
  if (minVal === '' || minVal === null || maxVal === '' || maxVal === null) return null;
  const nMin = Number(minVal);
  const nMax = Number(maxVal);
  if (Number.isNaN(nMin) || Number.isNaN(nMax)) return null;
  return nMin > nMax ? { minMaxLengthOrder: true } : null;
}

@Component({
  selector: 'app-modal-entity-account-type',
  templateUrl: './modal-entity-account-type.component.html',
  styleUrl: './modal-entity-account-type.component.scss',
})
export class ModalEntityAccountTypeComponent implements OnInit {
  @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() entityAccountTypeForm?: EntityAccountTypeList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<EntityAccountTypeList>();
  inputValue: string[] = [''];

  entityList: EntityList[] = [];
  accountTypeList: AccountTypeList[] = [];

  constructor(
    private userService: Users,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group(
      {
        entity_account_type_id: ['', [Validators.pattern('^[0-9]+$')]],
        entity_id: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        account_type_id: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        min_length: ['', [Validators.required, Validators.pattern(ENTITY_ACCOUNT_LENGTH_PATTERN)]],
        max_length: ['', [Validators.required, Validators.pattern(ENTITY_ACCOUNT_LENGTH_PATTERN)]],
        observation: ['', [Validators.pattern('^[^#$%&+-/*]{1,100}$')]],
      },
      { validators: [minMaxLengthOrderValidator] }
    );
  }
  ngOnInit(): void {
    this.getEntityTable();
    this.getAccountTypeTable();
    if (this.buttonmsg != 'Crear' && this.entityAccountTypeForm) {
      // Modo Editar: agregar validación requerida al ID
      this.formGroup.controls['entity_account_type_id'].setValidators([
        Validators.required,
        Validators.pattern('^[0-9]+$'),
      ]);
      this.formGroup.patchValue(this.entityAccountTypeForm);
    } else {
      // Modo Crear: remover validación requerida del ID
      this.formGroup.controls['entity_account_type_id'].clearValidators();
      this.formGroup.controls['entity_account_type_id'].setValidators([
        Validators.pattern('^[0-9]+$'),
      ]);
      this.formGroup.reset();
    }
    this.formGroup.controls['entity_account_type_id'].updateValueAndValidity();
  }

  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    const payload = {
      entity_id: Number(this.formGroup.controls['entity_id'].value),
      account_type_id: Number(this.formGroup.controls['account_type_id'].value),
      min_length: Number(this.formGroup.controls['min_length'].value),
      max_length: Number(this.formGroup.controls['max_length'].value),
      observation: this.formGroup.controls['observation'].value,
    } as EntityAccountTypeList;
    if (this.buttonmsg !== 'Crear') {
      payload.entity_account_type_id = Number(
        this.formGroup.controls['entity_account_type_id'].value
      );
    }
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }

  getEntityTable() {
    this.userService.getEntityList().subscribe({
      next: (response: BodyResponse<EntityList[]>) => {
        if (response.code === 200) {
          this.entityList = response.data
            .filter(item => item.is_active === 1)
            .map(item => ({
              ...item,
              is_active: true,
            }));
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
          this.accountTypeList = response.data
            .filter(item => item.is_active === 1)
            .map(item => ({
              ...item,
              is_active: true,
            }));
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
}
