import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateRequestInternalRoutingModule } from './create-request-internal-routing.module';
import { CreateRequestInternalComponent } from './create-request-internal.component';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { SharedModule } from '../../shared/shared.module';
import { RadioButtonModule } from 'primeng/radiobutton';

@NgModule({
  declarations: [CreateRequestInternalComponent],
  exports: [CreateRequestInternalComponent],
  imports: [
    CommonModule,
    CreateRequestInternalRoutingModule,
    CardModule,
    CheckboxModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    DropdownModule,
    ToastModule,
    SharedModule,
    RadioButtonModule,
  ],
})
export class CreateRequestInternalModule {}