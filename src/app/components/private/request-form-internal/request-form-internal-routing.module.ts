import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RequestFormInternalComponent } from './request-form-internal.component';

const routes: Routes = [{ path: '', component: RequestFormInternalComponent }];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestFormInternalRoutingModule {}