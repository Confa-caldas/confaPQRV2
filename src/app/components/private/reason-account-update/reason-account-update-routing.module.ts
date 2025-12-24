import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReasonAccountUpdateComponent } from './reason-account-update.component';

const routes: Routes = [{ path: '', component: ReasonAccountUpdateComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReasonAccountUpdateRoutingModule { }
