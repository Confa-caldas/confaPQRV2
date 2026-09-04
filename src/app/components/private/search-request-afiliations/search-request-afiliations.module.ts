import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchRequestAfiliationsRoutingModule } from './search-request-afiliations-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { SearchRequestAfiliationsComponent } from './search-request-afiliations.component';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [SearchRequestAfiliationsComponent],
  imports: [
    CommonModule,
    SearchRequestAfiliationsRoutingModule,
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
  exports: [SearchRequestAfiliationsComponent],
})
export class SearchRequestAfiliationsModule {}
