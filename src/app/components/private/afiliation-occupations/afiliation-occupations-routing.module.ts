import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AfiliationOccupationsComponent } from './afiliation-occupations.component';

const routes: Routes = [{ path: '', component: AfiliationOccupationsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AfiliationOccupationsRoutingModule {}