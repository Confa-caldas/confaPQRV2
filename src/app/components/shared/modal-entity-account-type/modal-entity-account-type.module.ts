import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalEntityAccountTypeComponent } from './modal-entity-account-type.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  declarations: [ModalEntityAccountTypeComponent],
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    ReactiveFormsModule,
  ],
  exports: [ModalEntityAccountTypeComponent],
})
export class ModalEntityAccountTypeModule { }
