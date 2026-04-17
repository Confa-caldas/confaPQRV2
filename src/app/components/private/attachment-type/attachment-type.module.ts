import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttachmentTypeRoutingModule } from './attachment-type-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { AttachmentTypeComponent } from './attachment-type.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [AttachmentTypeComponent],
  imports: [
    CommonModule,
    AttachmentTypeRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [AttachmentTypeComponent],
})
export class AttachmentTypeModule {}