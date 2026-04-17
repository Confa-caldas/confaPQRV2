import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankAccountAssociationRoutingModule } from './bank-account-association-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { BankAccountAssociationComponent } from './bank-account-association.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [BankAccountAssociationComponent],
  imports: [
    CommonModule,
    BankAccountAssociationRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [BankAccountAssociationComponent],
})
export class BankAccountAssociationModule {}
