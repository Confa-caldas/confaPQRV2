import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalEditUserEmailComponent } from './modal-edit-user-email.component';

@NgModule({
  declarations: [ModalEditUserEmailComponent],
  imports: [CommonModule, DialogModule, ButtonModule, InputTextModule, FormsModule, ReactiveFormsModule],
  exports: [ModalEditUserEmailComponent],
})
export class ModalEditUserEmailModule {}
