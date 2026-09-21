import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MonitorRpaAfiliacionRoutingModule } from './monitor-rpa-afiliacion-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { SharedModule } from '../../shared/shared.module';
import { MonitorRpaAfiliacionComponent } from './monitor-rpa-afiliacion.component';

@NgModule({
  declarations: [MonitorRpaAfiliacionComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MonitorRpaAfiliacionRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputTextModule,
    CalendarModule,
    OverlayPanelModule,
    SharedModule,
    ToastModule,
    DialogModule,
    TabViewModule,
    AccordionModule,
  ],
  exports: [MonitorRpaAfiliacionComponent],
})
export class MonitorRpaAfiliacionModule {}
