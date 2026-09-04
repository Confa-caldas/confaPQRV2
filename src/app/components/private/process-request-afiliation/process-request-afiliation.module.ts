import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessRequestAfiliationRoutingModule } from './process-request-afiliation-routing.module';
import { ProcessRequestAfiliationComponent } from './process-request-afiliation.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabViewModule } from 'primeng/tabview';
import { ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { AngleDoubleLeftIcon } from "primeng/icons/angledoubleleft";
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [ProcessRequestAfiliationComponent],
  imports: [
    CommonModule,
    ProcessRequestAfiliationRoutingModule,
    ButtonModule,
    TableModule,
    DialogModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
    MultiSelectModule,
    TabViewModule,
    ReactiveFormsModule,
    CalendarModule,
    TooltipModule,
    AngleDoubleLeftIcon
],
  exports: [ProcessRequestAfiliationComponent],
})
export class ProcessRequestAfiliationModule {}
