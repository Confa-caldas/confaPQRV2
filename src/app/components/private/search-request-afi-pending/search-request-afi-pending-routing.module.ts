import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchRequestAfiPendingComponent } from './search-request-afi-pending.component';

const routes: Routes = [{ path: '', component: SearchRequestAfiPendingComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchRequestAfiPendingRoutingModule {}