import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RequestPendingComponent } from './request-pending.component';

const routes: Routes = [{ path: '', component: RequestPendingComponent }];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestPendingRoutingModule {}
