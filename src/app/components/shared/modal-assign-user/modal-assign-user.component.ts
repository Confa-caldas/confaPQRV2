import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-assign-user',
  templateUrl: './modal-assign-user.component.html',
  styleUrl: './modal-assign-user.component.scss',
})
export class ModalAssignUserComponent {
  @Input() visibleDialogInput = false;
  @Input() filingNumber: string = '';
  @Input() loggedUserName: string = '';
  @Input() visible: boolean = false;
  @Output() setRta = new EventEmitter<boolean>();

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    this.visible = false;
  }
}
