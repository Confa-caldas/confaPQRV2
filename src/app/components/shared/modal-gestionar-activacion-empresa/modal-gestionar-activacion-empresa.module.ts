import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalGestionarActivacionEmpresaComponent } from './modal-gestionar-activacion-empresa.component';

@NgModule({
  declarations: [ModalGestionarActivacionEmpresaComponent],
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [ModalGestionarActivacionEmpresaComponent],
})
export class ModalGestionarActivacionEmpresaModule {}
