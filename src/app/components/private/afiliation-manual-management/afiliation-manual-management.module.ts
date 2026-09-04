import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AfiliationManualManagementRoutingModule } from './afiliation-manual-management-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { AfiliationManualManagementComponent } from './afiliation-manual-management.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [AfiliationManualManagementComponent],
  imports: [
    CommonModule,
    FormsModule,
    AfiliationManualManagementRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [AfiliationManualManagementComponent],
})
export class AfiliationManualManagementModule {}
