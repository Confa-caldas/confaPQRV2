import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MaritalStatusList } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';
import { BodyResponse } from '../../../models/shared/body-response.inteface';

@Component({
  selector: 'app-modal-marital-status',
  templateUrl: './modal-marital-status.component.html',
  styleUrl: './modal-marital-status.component.scss'
})
export class ModalMaritalStatusComponent {
 @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() maritalStatusForm?: MaritalStatusList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<MaritalStatusList>();

  inputValue: string[] = [''];
  maritalStatusLis!: MaritalStatusList[];
  //formGroup: FormGroup;

  constructor(
    private userService: Users,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = new FormGroup({
      id: new FormControl(null), 
      estado_civil: new FormControl(null, [Validators.required]),
    });
  }
  ngOnInit(): void {
    if (this.buttonmsg !== 'Crear' && this.maritalStatusForm) {
      this.formGroup.patchValue(this.maritalStatusForm);
    } else {
      this.formGroup.reset();
    }
    this.formGroup.get('estado_civil')?.addValidators(Validators.pattern('^[^#$%&]+$'));
  }

  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    const payload: MaritalStatusList = {
      id: this.formGroup.controls['id'].value,
      estado_civil: this.formGroup.controls['estado_civil'].value,
    };
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }
}
