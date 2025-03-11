import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestFormInternalComponent } from './request-form-internal.component';
import { RequestFormInternalRoutingModule } from './request-form-internal-routing.module';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ModalAlertModule } from '../../shared/modal-alert/modal-alert.module';
import { ModalFilingModule } from '../../shared/modal-filing/modal-filing.module';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { CheckboxModule } from 'primeng/checkbox';

@NgModule({
  declarations: [RequestFormInternalComponent],
  exports: [RequestFormInternalComponent],
  imports: [
    CommonModule,
    RequestFormInternalRoutingModule,
    CardModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    InputTextareaModule,
    ReactiveFormsModule,
    FormsModule,
    FileUploadModule,
    TableModule,
    ToastModule,
    ModalAlertModule,
    ModalFilingModule,
    ProgressSpinnerModule,
    DialogModule,
    ProgressBarModule,
    CheckboxModule
  ],
})
export class RequestFormInternalModule {}
