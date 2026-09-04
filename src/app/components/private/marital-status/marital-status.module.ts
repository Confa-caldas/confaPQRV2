import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaritalStatusRoutingModule } from './marital-status-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { MaritalStatusComponent } from './marital-status.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [MaritalStatusComponent],
  imports: [
    CommonModule,
    MaritalStatusRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [MaritalStatusComponent],
})
export class MaritalStatusModule {}