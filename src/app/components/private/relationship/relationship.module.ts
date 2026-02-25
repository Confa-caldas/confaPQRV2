import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelationshipRoutingModule } from './relationship-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { RelationshipComponent } from './relationship.component';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';

@NgModule({
  declarations: [RelationshipComponent],
  imports: [
    CommonModule,
    RelationshipRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
    CheckboxModule,
  ],
  exports: [RelationshipComponent],
})
export class RelationshipModule {}
