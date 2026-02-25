import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BankAccountAssociationComponent } from './bank-account-association.component';

const routes: Routes = [{ path: '', component: BankAccountAssociationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BankAccountAssociationRoutingModule {}
