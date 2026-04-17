import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponsibleList } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';

@Component({
  selector: 'app-modal-responsible',
  templateUrl: './modal-responsible.component.html',
  styleUrl: './modal-responsible.component.scss'
})
export class ModalResponsibleComponent {
 @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() responsibleForm?: ResponsibleList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<ResponsibleList>();

  inputValue: string[] = [''];
  responsibleList!: ResponsibleList[];

  //formGroup: FormGroup;

  constructor(
    private userService: Users,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = new FormGroup({
      id: new FormControl(null), 
      nombre_usuario_red: new FormControl(null, [Validators.required]),
    });
  }
  ngOnInit(): void {
    if (this.buttonmsg !== 'Crear' && this.responsibleForm) {
      this.formGroup.patchValue(this.responsibleForm);

    } else {
      this.formGroup.reset();
    }
    this.formGroup.get('nombre_usuario_red')?.addValidators(Validators.pattern('^[^#$%&]+$'));
  }

  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    const payload: ResponsibleList = {
      id: this.formGroup.controls['id'].value,
      nombre_usuario_red: this.formGroup.controls['nombre_usuario_red'].value,
    };
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }
}
