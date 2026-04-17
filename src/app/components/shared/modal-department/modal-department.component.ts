import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DepartmentList } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';

@Component({
  selector: 'app-modal-department',
  templateUrl: './modal-department.component.html',
  styleUrl: './modal-department.component.scss'
})
export class ModalDepartmentComponent {
 @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() departmentForm?: DepartmentList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<DepartmentList>();

  inputValue: string[] = [''];
  departmentList!: DepartmentList[];

  //formGroup: FormGroup;

  constructor(
    private userService: Users,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = new FormGroup({
      id: new FormControl(null), 
      codigo_departamento: new FormControl(null, [Validators.required]),
      nombre_departamento: new FormControl(null, [Validators.required]),
    });
  }
  ngOnInit(): void {
    if (this.buttonmsg !== 'Crear' && this.departmentForm) {
      this.formGroup.patchValue(this.departmentForm);

    } else {
      this.formGroup.reset();
    }
    this.formGroup.get('codigo_departamento')?.addValidators(Validators.pattern('^[^#$%&]+$'));
    this.formGroup.get('nombre_departamento')?.addValidators(Validators.pattern('^[^#$%&]+$'));
  }

  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    const payload: DepartmentList = {
      id: this.formGroup.controls['id'].value,
      codigo_departamento: this.formGroup.controls['codigo_departamento'].value,
      nombre_departamento: this.formGroup.controls['nombre_departamento'].value,
    };
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }
}
