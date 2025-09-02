import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchRequestExternalComponent } from './search-request-external.component';

const routes: Routes = [{ path: '', component: SearchRequestExternalComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchRequestExternalRoutingModule {}
