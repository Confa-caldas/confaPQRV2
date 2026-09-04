import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalResponsibleComponent } from './modal-responsible.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ModalResponsibleComponent],
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [ModalResponsibleComponent],
})
export class ModalResponsibleModule {}
