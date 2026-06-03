import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AfiliationDocumentTypePersonComponent } from './afiliation-document-type-person.component';

const routes: Routes = [{ path: '', component: AfiliationDocumentTypePersonComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AfiliationDocumentTypePersonRoutingModule {}
