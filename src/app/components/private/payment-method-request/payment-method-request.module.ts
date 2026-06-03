import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethodRequestRoutingModule } from './payment-method-request-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { PaymentMethodRequestComponent } from './payment-method-request.component';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [PaymentMethodRequestComponent],
  imports: [
    CommonModule,
    PaymentMethodRequestRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
    MultiSelectModule,
    ReactiveFormsModule,
    CalendarModule,
    TooltipModule,
  ],
  exports: [PaymentMethodRequestComponent],
})
export class PaymentMethodRequestModule { }
