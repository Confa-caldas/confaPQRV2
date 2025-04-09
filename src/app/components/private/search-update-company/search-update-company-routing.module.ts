import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchUpdateCompanyComponent } from './search-update-company.component';

const routes: Routes = [{ path: '', component: SearchUpdateCompanyComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchUpdateCompanyComponentRoutingModule {}
