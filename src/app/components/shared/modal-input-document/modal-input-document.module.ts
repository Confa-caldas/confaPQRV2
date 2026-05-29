import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalInputDocumentComponent } from './modal-input-document.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ModalInputDocumentComponent],
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [ModalInputDocumentComponent],
})
export class ModalInputDocumentModule {}
