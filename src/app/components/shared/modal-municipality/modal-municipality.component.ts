import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CategoryList, DepartmentList, ModalityList, MunicipalityList } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';


@Component({
  selector: 'app-modal-municipality',
  templateUrl: './modal-municipality.component.html',
  styleUrl: './modal-municipality.component.scss'
})
export class ModalMunicipalityComponent {
  @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() municipalityForm?: MunicipalityList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<MunicipalityList>();

  inputValue: string[] = [''];
  modalityList!: ModalityList[];
  departmentList!: DepartmentList[];

  //formGroup: FormGroup;

  constructor(
    private userService: Users,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = new FormGroup({
      id: new FormControl(null), 
      codigo_municipio: new FormControl(null, [Validators.required]),
      nombre_municipio: new FormControl(null, [Validators.required]),
      id_departamento: new FormControl(null, [Validators.required]),
    });
  }
  ngOnInit(): void {
    this.getDepartmentTable();
    if (this.buttonmsg !== 'Crear' && this.municipalityForm) {
      this.formGroup.patchValue(this.municipalityForm);
    } else {
      this.formGroup.reset();
    }
    this.formGroup.get('codigo_municipio')?.addValidators(Validators.pattern('^[0-9]+$'));
    this.formGroup.get('nombre_municipio')?.addValidators(Validators.pattern('^[^#$%&]+$'));
  }

  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }
  getDepartmentTable() {
    this.userService.getDepartmentList().subscribe({
      next: (response: BodyResponse<DepartmentList[]>) => {
        if (response.code === 200) {
          this.departmentList = response.data.filter(obj => obj.esta_activo !== false);
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
    const payload: MunicipalityList = {
      id: this.formGroup.controls['id'].value,
      codigo_municipio: this.formGroup.controls['codigo_municipio'].value,
      nombre_municipio: this.formGroup.controls['nombre_municipio'].value,
      id_departamento: this.formGroup.controls['id_departamento'].value,
    };
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }
}
