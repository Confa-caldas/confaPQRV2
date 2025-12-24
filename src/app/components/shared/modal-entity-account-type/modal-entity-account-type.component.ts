import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AccountTypeList,
  EntityList,
  EntityAccountTypeList,
} from '../../../models/users.interface';
import { Users } from '../../../services/users.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BodyResponse } from '../../../models/shared/body-response.inteface';

@Component({
  selector: 'app-modal-entity-account-type',
  templateUrl: './modal-entity-account-type.component.html',
  styleUrl: './modal-entity-account-type.component.scss',
})
export class ModalEntityAccountTypeComponent {
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
    this.formGroup = this.formBuilder.group({
      entity_account_type_id: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      entity_id: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      account_type_id: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      length: ['', [Validators.required, Validators.pattern('^(?:[1-9]|1\\d|20)$')]],
      observation: ['', [Validators.pattern('^[^#$%&+-/*]{1,100}$')]],
    });
  }
  ngOnInit(): void {
    this.getEntityTable();
    this.getAccountTypeTable();
    if (this.buttonmsg != 'Crear' && this.entityAccountTypeForm) {
      this.formGroup.patchValue(this.entityAccountTypeForm);
    } else {
      this.formGroup.reset();
    }
  }

  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    const payload: EntityAccountTypeList = {
      entity_account_type_id: this.formGroup.controls['entity_account_type_id'].value,
      entity_id: this.formGroup.controls['entity_id'].value,
      account_type_id: this.formGroup.controls['account_type_id'].value,
      length: this.formGroup.controls['length'].value,
      observation: this.formGroup.controls['observation'].value,
    };
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
