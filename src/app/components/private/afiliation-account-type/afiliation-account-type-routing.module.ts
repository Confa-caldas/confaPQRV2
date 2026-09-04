import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AfiliationAccountTypeComponent } from './afiliation-account-type.component';

const routes: Routes = [{ path: '', component: AfiliationAccountTypeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AfiliationAccountTypeRoutingModule {}
