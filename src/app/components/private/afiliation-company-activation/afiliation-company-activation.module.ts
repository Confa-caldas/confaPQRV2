import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AfiliationCompanyActivationRoutingModule } from './afiliation-company-activation-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { SharedModule } from '../../shared/shared.module';
import { AfiliationCompanyActivationComponent } from './afiliation-company-activation.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [AfiliationCompanyActivationComponent],
  imports: [
    CommonModule,
    FormsModule,
    AfiliationCompanyActivationRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    RadioButtonModule,
    InputTextModule,
    SharedModule,
    ToastModule,
  ],
  exports: [AfiliationCompanyActivationComponent],
})
export class AfiliationCompanyActivationModule {}
