import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalManagerSelectorComponent } from './modal-manager-selector.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  declarations: [ModalManagerSelectorComponent],
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    ReactiveFormsModule,
  ],
  exports: [ModalManagerSelectorComponent],
})
export class ModalManagerSelectorModule {}
