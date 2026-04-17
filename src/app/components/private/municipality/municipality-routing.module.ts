import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MunicipalityComponent } from './municipality.component';

const routes: Routes = [{ path: '', component: MunicipalityComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MunicipalityRoutingModule {}
