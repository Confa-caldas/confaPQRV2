import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponsibleRoutingModule } from './responsible-routing.module';
import { ResponsibleComponent } from './responsible.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [ResponsibleComponent],
  imports: [
    CommonModule,
    ResponsibleRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [ResponsibleComponent],
})
export class ResponsibleModule {}
