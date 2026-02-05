import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchRequestAfiMassiveRoutingModule } from './search-request-afi-massive-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { SearchRequestAfiMassiveComponent } from './search-request-afi-massive.component';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [SearchRequestAfiMassiveComponent],
  imports: [
    CommonModule,
    SearchRequestAfiMassiveRoutingModule,
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
  exports: [SearchRequestAfiMassiveComponent],
})
export class SearchRequestAfiMassiveModule {}
