import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AfiliationAccountTypeRoutingModule } from './afiliation-account-type-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { AfiliationAccountTypeComponent } from './afiliation-account-type.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [AfiliationAccountTypeComponent],
  imports: [
    CommonModule,
    AfiliationAccountTypeRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [AfiliationAccountTypeComponent],
})
export class AfiliationAccountTypeModule {}
