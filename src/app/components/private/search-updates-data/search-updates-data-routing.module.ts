import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchUpdatesDataComponent } from './search-updates-data.component';

const routes: Routes = [{ path: '', component: SearchUpdatesDataComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchUpdatesDataRoutingModule {}