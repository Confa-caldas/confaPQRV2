import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SystemVariableList } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';

@Component({
  selector: 'app-modal-system-variable',
  templateUrl: './modal-system-variable.component.html',
  styleUrl: './modal-system-variable.component.scss'
})
export class ModalSystemVariableComponent {
@Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() systemVariableForm?: SystemVariableList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<SystemVariableList>();

  inputValue: string[] = [''];
  systemVariableList!: SystemVariableList[];

  //formGroup: FormGroup;

  constructor(
    private userService: Users,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = new FormGroup({
      id: new FormControl(null), 
      nombre_variable: new FormControl(null, [Validators.required]),
      valor_variable: new FormControl(null, [Validators.required]),
      descripcion: new FormControl(null), 
    });
  }
  ngOnInit(): void {
    if (this.buttonmsg !== 'Crear' && this.systemVariableForm) {
      this.formGroup.patchValue(this.systemVariableForm);
    } else {
      this.formGroup.reset();
    }
    this.formGroup.get('nombre_variable')?.addValidators(Validators.pattern('^[^#$%&]+$'));
    this.formGroup.get('valor_variable')?.addValidators(Validators.pattern('^[^#$%&]+$'));
  }

  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    const payload: SystemVariableList = {
      id: this.formGroup.controls['id'].value,
      nombre_variable: this.formGroup.controls['nombre_variable'].value,
      valor_variable: this.formGroup.controls['valor_variable'].value,
      descripcion: this.formGroup.controls['descripcion'].value,
    };
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }
}
