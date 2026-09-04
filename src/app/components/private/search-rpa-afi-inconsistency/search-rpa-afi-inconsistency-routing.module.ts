import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchRpaAfiInconsistencyComponent } from './search-rpa-afi-inconsistency.component';

const routes: Routes = [{ path: '', component: SearchRpaAfiInconsistencyComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchRpaAfiInconsistencyRoutingModule {}
