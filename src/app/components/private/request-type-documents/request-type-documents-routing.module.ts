import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestTypeDocumentsComponent } from './request-type-documents.component';

const routes: Routes = [{ path: '', component: RequestTypeDocumentsComponent }];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestTypeDocumentsRoutingModule {}