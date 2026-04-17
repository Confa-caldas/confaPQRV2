import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AfiliationTemplateValidationsComponent } from './afiliation-template-validations.component';

const routes: Routes = [{ path: '', component: AfiliationTemplateValidationsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AfiliationTemplateValidationsRoutingModule {}