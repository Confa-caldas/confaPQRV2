import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestypeManagerAssociateComponent } from './requestype-manager-associate.component';

const routes: Routes = [{ path: '', component: RequestypeManagerAssociateComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestypeManagerAssociateRoutingModule {}
