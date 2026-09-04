import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AfiliationOccupationsRoutingModule } from './afiliation-occupations-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { AfiliationOccupationsComponent } from './afiliation-occupations.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [AfiliationOccupationsComponent],
  imports: [
    CommonModule,
    FormsModule,
    AfiliationOccupationsRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [AfiliationOccupationsComponent],
})
export class AfiliationOccupationsModule {}