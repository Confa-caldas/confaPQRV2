import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityAccountTypeRoutingModule } from './entity-account-type-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { EntityAccountTypeComponent } from './entity-account-type.component'
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [EntityAccountTypeComponent],
  imports: [
    CommonModule,
    EntityAccountTypeRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [EntityAccountTypeComponent],
})
export class EntityAccountTypeModule { }
