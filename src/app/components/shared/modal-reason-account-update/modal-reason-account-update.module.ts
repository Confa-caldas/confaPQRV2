import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalReasonAccountUpdateComponent } from './modal-reason-account-update.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  declarations: [ModalReasonAccountUpdateComponent],
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    ReactiveFormsModule,
  ],
  exports: [ModalReasonAccountUpdateComponent],
})
export class ModalReasonAccountUpdateModule { }
