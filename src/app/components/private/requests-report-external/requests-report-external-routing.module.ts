import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestsReportExternalComponent } from './requests-report-external.component';

const routes: Routes = [{ path: '', component: RequestsReportExternalComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestsReportExternalRoutingModule {}
