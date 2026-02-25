import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentTypeComponent } from './document-type.component';

const routes: Routes = [{ path: '', component: DocumentTypeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentTypeRoutingModule {}