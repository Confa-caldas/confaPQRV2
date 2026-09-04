import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenderRoutingModule } from './afiliation-notification-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { AfiliationNotificationsComponent } from './afiliation-notifications.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [AfiliationNotificationsComponent],
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
  exports: [AfiliationNotificationsComponent],
})
export class AfiliationNotificationsModule {}