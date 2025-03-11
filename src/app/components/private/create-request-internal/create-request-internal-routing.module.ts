import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateRequestInternalComponent } from './create-request-internal.component';

const routes: Routes = [{ path: '', component: CreateRequestInternalComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateRequestInternalRoutingModule {}
