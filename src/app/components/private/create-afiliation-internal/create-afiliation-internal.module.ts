import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateAfiliationInternalComponent } from './create-afiliation-internal.component';
import { CreateAfiliationInternalRoutingModule } from './create-afiliation-internal-routing.module';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ToastModule } from 'primeng/toast';
import { AccordionModule } from 'primeng/accordion';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [CreateAfiliationInternalComponent],
  providers: [MessageService],
  imports: [
    CommonModule,
    CreateAfiliationInternalRoutingModule,
    CardModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    DropdownModule,
    InputTextModule,
    KeyFilterModule,
    ToastModule,
    AccordionModule,
    CalendarModule,
    InputNumberModule,
    SharedModule,
  ],
  exports: [CreateAfiliationInternalComponent],
})
export class CreateAfiliationInternalModule {}
