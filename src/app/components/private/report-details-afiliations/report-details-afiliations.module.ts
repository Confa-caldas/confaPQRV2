import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportDetailsAfiliationsRoutingModule } from './report-details-afiliations-routing.module';
import { ReportDetailsAfiliationsComponent } from './report-details-afiliations.component';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { SharedModule } from '../../shared/shared.module';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [ReportDetailsAfiliationsComponent],
  imports: [
    CommonModule,
    ReportDetailsAfiliationsRoutingModule,
    AccordionModule,
    TableModule,
    SharedModule,
    ToastModule,
  ],
  exports: [ReportDetailsAfiliationsComponent],
})
export class ReportDetailsAfiliationsModule {}
