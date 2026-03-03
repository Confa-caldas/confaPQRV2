import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchUpdatesDataRoutingModule } from './search-updates-data-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { SearchUpdatesDataComponent } from './search-updates-data.component';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [SearchUpdatesDataComponent],
  imports: [
    CommonModule,
    SearchUpdatesDataRoutingModule,
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
  exports: [SearchUpdatesDataComponent],
})
export class SearchUpdatesDataModule {}
