import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReasonAccountUpdateList } from '../../../models/users.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-modal-reason-account-update',
  templateUrl: './modal-reason-account-update.component.html',
  styleUrl: './modal-reason-account-update.component.scss'
})
export class ModalReasonAccountUpdateComponent {
  @Input() login = false;
  @Input() select = false;
  @Input() message = '';
  @Input() buttonmsg = '';
  @Input() visible: boolean = false;
  @Input() read_only: boolean = false;
  @Input() reasonAccountUpdateForm?: ReasonAccountUpdateList;
  @Output() setRta = new EventEmitter<boolean>();
  @Output() setRtaParameter = new EventEmitter<ReasonAccountUpdateList>();
  inputValue: string[] = [''];

  constructor(private formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      reason_account_update_id: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      reason: ['', [Validators.required, Validators.pattern('^[^#$%&+-/*]+$')]],
    });
  }

  ngOnInit(): void {
    if (this.buttonmsg != 'Crear' && this.reasonAccountUpdateForm) {
      this.formGroup.patchValue(this.reasonAccountUpdateForm);
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
    const payload: ReasonAccountUpdateList = {
      reason_account_update_id: this.formGroup.controls['reason_account_update_id'].value,
      reason: this.formGroup.controls['reason'].value,
    };
    this.setRtaParameter.emit(payload);
    this.visible = false;
  }  
}
