import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalSuccessfulTransferComponent } from './modal-successful-transfer.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [ModalSuccessfulTransferComponent],
  imports: [CommonModule, DialogModule, ButtonModule],
  exports: [ModalSuccessfulTransferComponent],
})
export class ModalSuccessfulTransferModule {}
