import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AfiliationRejectionComponent } from './afiliation-rejection.component';

const routes: Routes = [{ path: '', component: AfiliationRejectionComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AfiliationRejectionRoutingModule {}