import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenderRoutingModule } from './gender-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { GenderComponent } from './gender.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [GenderComponent],
  imports: [
    CommonModule,
    GenderRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [GenderComponent],
})
export class GenderModule {}