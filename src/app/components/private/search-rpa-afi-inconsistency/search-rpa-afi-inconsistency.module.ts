import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchRpaAfiInconsistencyRoutingModule } from './search-rpa-afi-inconsistency-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SharedModule } from '../../shared/shared.module';
import { SearchRpaAfiInconsistencyComponent } from './search-rpa-afi-inconsistency.component';
import { ToastModule } from 'primeng/toast';
import { KeyFilterModule } from 'primeng/keyfilter';

@NgModule({
  declarations: [SearchRpaAfiInconsistencyComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SearchRpaAfiInconsistencyRoutingModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    DialogModule,
    InputTextModule,
    KeyFilterModule,
    SharedModule,
    ToastModule,
  ],
  exports: [SearchRpaAfiInconsistencyComponent],
})
export class SearchRpaAfiInconsistencyModule {}
