import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchUpdateCompanyComponentRoutingModule } from './search-update-company-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { SearchUpdateCompanyComponent } from './search-update-company.component';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { NgxDocViewerModule } from 'ngx-doc-viewer';

@NgModule({
  declarations: [SearchUpdateCompanyComponent],
  imports: [
    CommonModule,
    SearchUpdateCompanyComponentRoutingModule,
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
    DialogModule,
    NgxDocViewerModule
  ],
  exports: [SearchUpdateCompanyComponent],
})
export class SearchUpdateCompanyModule {}
