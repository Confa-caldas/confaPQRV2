import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AfiliationCertificateComponent } from './afiliation-certificate.component';

const routes: Routes = [{ path: '', component: AfiliationCertificateComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AfiliationCertificateRoutingModule {}