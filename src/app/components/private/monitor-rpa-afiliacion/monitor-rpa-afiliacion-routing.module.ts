import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MonitorRpaAfiliacionComponent } from './monitor-rpa-afiliacion.component';

const routes: Routes = [{ path: '', component: MonitorRpaAfiliacionComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MonitorRpaAfiliacionRoutingModule {}
