import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountTypeRoutingModule } from './account-type-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { AccountTypeComponent } from './account-type.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [AccountTypeComponent],
  imports: [
    CommonModule,
    AccountTypeRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [AccountTypeComponent],
})
export class AccountTypeModule {}