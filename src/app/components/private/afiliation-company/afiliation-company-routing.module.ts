import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AfiliationCompanyComponent } from './afiliation-company.component';

const routes: Routes = [{ path: '', component: AfiliationCompanyComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AfiliationCompanyRoutingModule {}