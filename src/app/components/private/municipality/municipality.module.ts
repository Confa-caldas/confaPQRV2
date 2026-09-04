import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MunicipalityRoutingModule } from './municipality-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { MunicipalityComponent } from './municipality.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [MunicipalityComponent],
  imports: [
    CommonModule,
    MunicipalityRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [MunicipalityComponent],
})
export class MunicipalityModule {}
