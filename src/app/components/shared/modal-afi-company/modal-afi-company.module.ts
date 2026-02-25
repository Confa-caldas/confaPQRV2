import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ModalAfiCompanyComponent } from './modal-afi-company.component';
import { RadioButtonModule } from "primeng/radiobutton";
import { CheckboxModule } from 'primeng/checkbox';

@NgModule({
  declarations: [ModalAfiCompanyComponent],
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    ReactiveFormsModule,
    RadioButtonModule,
    CheckboxModule
],
  exports: [ModalAfiCompanyComponent],
})
export class ModalAfiCompanyModule {}