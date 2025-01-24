import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestPendingComponent } from './request-pending.component';
import { RequestPendingRoutingModule } from './request-pending-routing.module';
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

@NgModule({
  declarations: [RequestPendingComponent],
  exports: [RequestPendingComponent],
  imports: [
    CommonModule,
    RequestPendingRoutingModule,
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
    ProgressBarModule
  ],
})
export class RequestPendingModule {}