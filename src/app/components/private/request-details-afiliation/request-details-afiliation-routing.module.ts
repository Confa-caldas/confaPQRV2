import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestDetailsAfiliationComponent } from './request-details-afiliation.component';

const routes: Routes = [{ path: '', component: RequestDetailsAfiliationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestDetailsAfiliationRoutingModule {}
