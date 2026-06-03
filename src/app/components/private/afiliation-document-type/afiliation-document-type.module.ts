import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AfiliationDocumentTypeRoutingModule } from './afiliation-document-type-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { AfiliationDocumentTypeComponent } from './afiliation-document-type.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [AfiliationDocumentTypeComponent],
  imports: [
    CommonModule,
    AfiliationDocumentTypeRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [AfiliationDocumentTypeComponent],
})
export class AfiliationDocumentTypeModule {}
