import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaritalStatusComponent } from './marital-status.component';

const routes: Routes = [{ path: '', component: MaritalStatusComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MaritalStatusRoutingModule {}