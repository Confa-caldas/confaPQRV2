import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentTypeRoutingModule } from './document-type-routing.module';
import { DocumentTypeComponent } from './document-type.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { ToastModule } from 'primeng/toast';
import { ModalInputDocumentModule } from "../../shared/modal-input-document/modal-input-document.module";

@NgModule({
  declarations: [DocumentTypeComponent],
  imports: [
    CommonModule,
    DocumentTypeRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
    ModalInputDocumentModule
],
  exports: [DocumentTypeComponent],
})
export class DocumentTypeModule {}