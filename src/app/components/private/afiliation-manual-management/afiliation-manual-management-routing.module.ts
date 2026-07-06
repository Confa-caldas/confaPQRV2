import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AfiliationManualManagementComponent } from './afiliation-manual-management.component';

const routes: Routes = [{ path: '', component: AfiliationManualManagementComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AfiliationManualManagementRoutingModule {}
