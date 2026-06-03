import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AfiliationDocumentTypeComponent } from './afiliation-document-type.component';

const routes: Routes = [{ path: '', component: AfiliationDocumentTypeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AfiliationDocumentTypeRoutingModule {}
