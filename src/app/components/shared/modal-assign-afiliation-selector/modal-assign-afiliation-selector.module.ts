import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalAssignAfiliationSelectorComponent } from './modal-assign-afiliation-selector.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  declarations: [ModalAssignAfiliationSelectorComponent],
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    ReactiveFormsModule,
  ],
  exports: [ModalAssignAfiliationSelectorComponent],
})
export class ModalAssignAfiliationSelectorModule {}
