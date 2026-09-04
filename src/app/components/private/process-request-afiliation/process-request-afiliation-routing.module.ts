import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProcessRequestAfiliationComponent } from './process-request-afiliation.component';

const routes: Routes = [{ path: '', component: ProcessRequestAfiliationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProcessRequestAfiliationRoutingModule {}
