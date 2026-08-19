import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EntityList, EntityTypeList } from '../../../models/users.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';

@Component({
  selector: 'app-modal-entity',
  templateUrl: './modal-entity.component.html',
  styleUrl: './modal-entity.component.scss',
})
export class ModalEntityComponent {
  @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() entityForm?: EntityList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<EntityList>();
  inputValue: string[] = [''];

  entityTypeList: EntityTypeList[] = [];

  constructor(
    private userService: Users,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = this.formBuilder.group({
      entity_code: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9]+$')]],
      entity_name: ['', [Validators.required, Validators.pattern('^[^#$%*/]+$')]],
      entity_type_id: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    });
  }
  ngOnInit(): void {
    this.getEntityTypeTable();
    if (this.buttonmsg != 'Crear' && this.entityForm) {
      this.formGroup.patchValue(this.entityForm);
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
    console.log('En el payload', this.entityForm);
    const payload: EntityList = {
      ...(this.buttonmsg != 'Crear' && this.entityForm
        ? { entity_id: this.entityForm.entity_id }
        : {}),
      entity_code: this.formGroup.controls['entity_code'].value,
      entity_name: this.formGroup.controls['entity_name'].value,
      entity_type_id: this.formGroup.controls['entity_type_id'].value,
    };
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }

  getEntityTypeTable() {
    this.userService.getEntityTypeList().subscribe({
      next: (response: BodyResponse<EntityTypeList[]>) => {
        if (response.code === 200) {
          this.entityTypeList = response.data
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
