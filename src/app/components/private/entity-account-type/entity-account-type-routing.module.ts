import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntityAccountTypeComponent } from './entity-account-type.component';

const routes: Routes = [{ path: '', component: EntityAccountTypeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntityAccountTypeRoutingModule { }
