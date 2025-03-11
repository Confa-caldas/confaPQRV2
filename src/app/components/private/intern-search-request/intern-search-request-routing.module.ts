import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InternSearchRequestComponent } from './intern-search-request.component';

const routes: Routes = [{ path: '', component: InternSearchRequestComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternSearchRequestRoutingModule {}
