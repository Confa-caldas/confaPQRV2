import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-successful-transfer',
  templateUrl: './modal-successful-transfer.component.html',
  styleUrl: './modal-successful-transfer.component.scss',
})
export class ModalSuccessfulTransferComponent {
  @Input() visible: boolean = false;
  @Input() message = '';
  @Output() setRta = new EventEmitter<boolean>();

  closeDialog(value: boolean) {
    this.setRta.emit(value);
    this.visible = false;
  }
}
