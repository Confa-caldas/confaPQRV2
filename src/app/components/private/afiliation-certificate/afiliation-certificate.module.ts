import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AfiliationCertificateRoutingModule } from './afiliation-certificate-rounting.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from '../../shared/shared.module';
import { AfiliationCertificateComponent } from './afiliation-certificate.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [AfiliationCertificateComponent],
  imports: [
    CommonModule,
    AfiliationCertificateRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputSwitchModule,
    SharedModule,
    ToastModule,
  ],
  exports: [AfiliationCertificateComponent],
})
export class AfiliationCertificateModule {}