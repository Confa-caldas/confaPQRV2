import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentTypePersonRoutingModule } from './document-type-person-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { DocumentTypePersonComponent } from './document-type-person.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [DocumentTypePersonComponent],
  imports: [
    CommonModule,
    DocumentTypePersonRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [DocumentTypePersonComponent],
})
export class DocumentTypePersonModule {}