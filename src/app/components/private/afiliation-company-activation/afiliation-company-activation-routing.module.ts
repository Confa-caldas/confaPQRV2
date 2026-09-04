import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AfiliationCompanyActivationComponent } from './afiliation-company-activation.component';

const routes: Routes = [{ path: '', component: AfiliationCompanyActivationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AfiliationCompanyActivationRoutingModule {}
