import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResponsibleComponent } from './responsible.component';

const routes: Routes = [{ path: '', component: ResponsibleComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResponsibleRoutingModule {}
