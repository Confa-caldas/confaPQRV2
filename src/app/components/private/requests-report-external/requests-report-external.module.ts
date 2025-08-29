import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestsReportExternalRoutingModule } from './requests-report-external-routing.module';
import { RequestsReportExternalComponent } from './requests-report-external.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

@NgModule({
  declarations: [RequestsReportExternalComponent],
  imports: [
    CommonModule,
    RequestsReportExternalRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    ReactiveFormsModule,
    InputSwitchModule,
    SharedModule,
    CalendarModule,
    ToastModule,
    MultiSelectModule,
  ],
  exports: [RequestsReportExternalComponent],
})
export class RequestsReportExternalModule {}
