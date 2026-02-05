import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchRequestAfiMassiveComponent } from './search-request-afi-massive.component';

const routes: Routes = [{ path: '', component: SearchRequestAfiMassiveComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchRequestAfiMassiveRoutingModule {}