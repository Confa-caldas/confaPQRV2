import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchRequestAfiliationsComponent } from './search-request-afiliations.component';

const routes: Routes = [{ path: '', component: SearchRequestAfiliationsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchRequestAfiliationsRoutingModule {}