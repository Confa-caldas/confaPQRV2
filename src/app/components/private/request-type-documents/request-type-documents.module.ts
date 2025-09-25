import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestTypeDocumentsRoutingModule } from './request-type-documents-routing.module';
import { RequestTypeDocumentsComponent } from './request-type-documents.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { ToastModule } from 'primeng/toast';
import { ModalInputDocumentModule } from "../../shared/modal-input-document/modal-input-document.module";
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PickListModule } from 'primeng/picklist';

@NgModule({
  declarations: [RequestTypeDocumentsComponent],
  imports: [
    CommonModule,
    RequestTypeDocumentsRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
    ModalInputDocumentModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    PickListModule,
],
  exports: [RequestTypeDocumentsComponent],
})
export class RequestTypeDocumentsModule {}