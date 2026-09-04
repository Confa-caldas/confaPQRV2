import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PadresRpaNoProcesadoRoutingModule } from './padres-rpa-no-procesado-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { SharedModule } from '../../shared/shared.module';
import { PadresRpaNoProcesadoComponent } from './padres-rpa-no-procesado.component';

@NgModule({
  declarations: [PadresRpaNoProcesadoComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PadresRpaNoProcesadoRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    SharedModule,
    ToastModule,
  ],
  exports: [PadresRpaNoProcesadoComponent],
})
export class PadresRpaNoProcesadoModule {}
