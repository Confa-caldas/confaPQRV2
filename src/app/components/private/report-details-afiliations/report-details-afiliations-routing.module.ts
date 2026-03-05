import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportDetailsAfiliationsComponent } from './report-details-afiliations.component';

const routes: Routes = [{ path: '', component: ReportDetailsAfiliationsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportDetailsAfiliationsRoutingModule {}
