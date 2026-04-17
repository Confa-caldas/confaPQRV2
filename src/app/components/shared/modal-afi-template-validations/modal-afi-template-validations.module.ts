import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ModalAfiTemplateValidationsComponent } from './modal-afi-template-validations.component';
import { RadioButtonModule } from "primeng/radiobutton";

@NgModule({
  declarations: [ModalAfiTemplateValidationsComponent],
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    ReactiveFormsModule,
    RadioButtonModule
],
  exports: [ModalAfiTemplateValidationsComponent],
})
export class ModalAfiTemplateValidationsModule {}