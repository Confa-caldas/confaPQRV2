import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CategoryList, GenderList, ModalityList } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';

@Component({
  selector: 'app-modal-gender',
  templateUrl: './modal-gender.component.html',
  styleUrl: './modal-gender.component.scss'
})
export class ModalGenderComponent {
  @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() genderForm?: GenderList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<GenderList>();

  inputValue: string[] = [''];
  genderList!: GenderList[];

  //formGroup: FormGroup;

  constructor(
    private userService: Users,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = new FormGroup({
      id: new FormControl(null), 
      genero: new FormControl(null, [Validators.required]),
    });
  }
  ngOnInit(): void {
    if (this.buttonmsg !== 'Crear' && this.genderForm) {
      this.formGroup.patchValue(this.genderForm);

    } else {
      this.formGroup.reset();
    }
    this.formGroup.get('genero')?.addValidators(Validators.pattern('^[^#$%&]+$'));
  }

  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    const payload: GenderList = {
      id: this.formGroup.controls['id'].value,
      genero: this.formGroup.controls['genero'].value,
    };
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }
}
