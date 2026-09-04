import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ModalSearchPersonDataComponent } from './modal-search-person-data.component';

@NgModule({
  declarations: [ModalSearchPersonDataComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
  ],
  exports: [ModalSearchPersonDataComponent],
})
export class ModalSearchPersonDataModule {}
