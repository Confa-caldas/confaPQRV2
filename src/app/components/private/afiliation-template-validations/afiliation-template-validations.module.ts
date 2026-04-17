import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AfiliationTemplateValidationsRoutingModule } from './afiliation-template-validations-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { AfiliationTemplateValidationsComponent } from './afiliation-template-validations.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [AfiliationTemplateValidationsComponent],
  imports: [
    CommonModule,
    AfiliationTemplateValidationsRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [AfiliationTemplateValidationsComponent],
})
export class AfiliationTemplateValidationsModule {}