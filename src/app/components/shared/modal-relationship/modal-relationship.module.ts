import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ModalRelationshipComponent } from './modal-relationship.component';
import { CheckboxModule } from 'primeng/checkbox';

@NgModule({
  declarations: [ModalRelationshipComponent],
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    ReactiveFormsModule,
    CheckboxModule,
  ],
  exports: [ModalRelationshipComponent],
})
export class ModalRelationshipModule {}
