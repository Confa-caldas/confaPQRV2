import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UpdatesDataDetailsComponent } from './updates-data-details.component';

const routes: Routes = [{ path: '', component: UpdatesDataDetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UpdatesDataDetailsRoutingModule {}
