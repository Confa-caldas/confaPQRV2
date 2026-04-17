import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AfiNotificationList } from '../../../models/users.interface';
import { Users } from '../../../services/users.service';

@Component({
  selector: 'app-modal-afiliation-notification',
  templateUrl: './modal-afiliation-notification.component.html',
  styleUrl: './modal-afiliation-notification.component.scss'
})
export class ModalAfiliationNotificationComponent {
 @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() afiNotificationForm?: AfiNotificationList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<AfiNotificationList>();

  inputValue: string[] = [''];
  afiNotificationList!: AfiNotificationList[];

  //formGroup: FormGroup;

  constructor(
    private userService: Users,
    private formBuilder: FormBuilder
  ) {
    this.formGroup = new FormGroup({
      id: new FormControl(null), 
      nombre_mensaje: new FormControl(null, [Validators.required]),
      texto_mensaje: new FormControl(null, [Validators.required]),
    });
  }
  ngOnInit(): void {
    if (this.buttonmsg !== 'Crear' && this.afiNotificationForm) {
      this.formGroup.patchValue(this.afiNotificationForm);

    } else {
      this.formGroup.reset();
    }
    this.formGroup.get('nombre_mensaje')?.addValidators(Validators.pattern('^[^#$%&]+$'));
    this.formGroup.get('texto_mensaje')?.addValidators(Validators.pattern('^[^#$%&]+$'));
  }

  formGroup: FormGroup<any> = new FormGroup<any>({});
  showDialog() {
    this.visible = true;
  }

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    const payload: AfiNotificationList = {
      id: this.formGroup.controls['id'].value,
      nombre_mensaje: this.formGroup.controls['nombre_mensaje'].value,
      texto_mensaje: this.formGroup.controls['texto_mensaje'].value
    };
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }
}
