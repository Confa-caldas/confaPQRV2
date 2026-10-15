import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UserManagementRoutingModule } from './user-management-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { SharedModule } from '../../shared/shared.module';
import { UserManagementComponent } from './user-management.component';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [UserManagementComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UserManagementRoutingModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    SharedModule,
    ToastModule,
  ],
  exports: [UserManagementComponent],
})
export class UserManagementModule {}
