import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateAfiliationInternalComponent } from './create-afiliation-internal.component';

const routes: Routes = [{ path: '', component: CreateAfiliationInternalComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateAfiliationInternalRoutingModule {}
