import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchRequestAfiPendingRoutingModule } from './search-request-afi-pending-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { SearchRequestAfiPendingComponent } from './search-request-afi-pending.component';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [SearchRequestAfiPendingComponent],
  imports: [
    CommonModule,
    SearchRequestAfiPendingRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
    MultiSelectModule,
    ReactiveFormsModule,
    CalendarModule,
    TooltipModule,
  ],
  exports: [SearchRequestAfiPendingComponent],
})
export class SearchRequestAfiPendingModule {}
