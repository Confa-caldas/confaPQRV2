import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AfiliationCompanyRoutingModule } from './afiliation-company-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { AfiliationCompanyComponent } from './afiliation-company.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [AfiliationCompanyComponent],
  imports: [
    CommonModule,
    AfiliationCompanyRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [AfiliationCompanyComponent],
})
export class AfiliationCompanyModule {}