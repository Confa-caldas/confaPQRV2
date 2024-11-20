import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestypeManagerAssociateRoutingModule } from './requestype-manager-associate-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { RequestypeManagerAssociateComponent } from './requestype-manager-associate.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [RequestypeManagerAssociateComponent],
  imports: [
    CommonModule,
    RequestypeManagerAssociateRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [RequestypeManagerAssociateComponent],
})
export class RequestypeManagerAssociateModule {}
