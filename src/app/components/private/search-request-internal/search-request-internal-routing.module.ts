import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchRequestInternalComponent } from './search-request-internal.component';

const routes: Routes = [{ path: '', component: SearchRequestInternalComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchRequestInternalRoutingModule {}