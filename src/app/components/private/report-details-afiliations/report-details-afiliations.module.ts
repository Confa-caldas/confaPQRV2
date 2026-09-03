import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ReportDetailsAfiliationsRoutingModule } from './report-details-afiliations-routing.module';
import { ReportDetailsAfiliationsComponent } from './report-details-afiliations.component';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { SharedModule } from '../../shared/shared.module';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';

@NgModule({
  declarations: [ReportDetailsAfiliationsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReportDetailsAfiliationsRoutingModule,
    AccordionModule,
    TableModule,
    SharedModule,
    ToastModule,
    CalendarModule,
    ButtonModule,
    PaginatorModule,
  ],
  exports: [ReportDetailsAfiliationsComponent],
})
export class ReportDetailsAfiliationsModule {}
