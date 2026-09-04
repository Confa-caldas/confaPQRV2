import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RelationshipComponent } from './relationship.component';

const routes: Routes = [{ path: '', component: RelationshipComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RelationshipRoutingModule {}
