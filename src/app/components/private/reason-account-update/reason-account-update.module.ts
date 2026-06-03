import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReasonAccountUpdateRoutingModule } from './reason-account-update-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { ReasonAccountUpdateComponent } from './reason-account-update.component';
import { ToastModule } from 'primeng/toast';


@NgModule({
  declarations: [ReasonAccountUpdateComponent],
  imports: [
    CommonModule,
    ReasonAccountUpdateRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [ReasonAccountUpdateComponent],
})
export class ReasonAccountUpdateModule { }