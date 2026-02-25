import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemVariablesComponent } from './system-variables.component';

const routes: Routes = [{ path: '', component: SystemVariablesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SystemVariablesRoutingModule {}