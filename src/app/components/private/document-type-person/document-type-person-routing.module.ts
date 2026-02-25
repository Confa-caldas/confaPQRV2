import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentTypePersonComponent } from './document-type-person.component';

const routes: Routes = [{ path: '', component: DocumentTypePersonComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentTypePersonRoutingModule {}