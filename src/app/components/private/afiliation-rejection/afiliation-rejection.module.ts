import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AfiliationRejectionRoutingModule } from './afiliation-rejection-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { AfiliationRejectionComponent } from './afiliation-rejection.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [AfiliationRejectionComponent],
  imports: [
    CommonModule,
    FormsModule,
    AfiliationRejectionRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [AfiliationRejectionComponent],
})
export class AfiliationRejectionModule {}