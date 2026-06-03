import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AfiliationDocumentTypePersonRoutingModule } from './afiliation-document-type-person-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { AfiliationDocumentTypePersonComponent } from './afiliation-document-type-person.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [AfiliationDocumentTypePersonComponent],
  imports: [
    CommonModule,
    AfiliationDocumentTypePersonRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [AfiliationDocumentTypePersonComponent],
})
export class AfiliationDocumentTypePersonModule {}
