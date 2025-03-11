import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormCompanyComponent } from './form-company.component';

const routes: Routes = [{ path: '', component: FormCompanyComponent }];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormCompanyRoutingModule {}
