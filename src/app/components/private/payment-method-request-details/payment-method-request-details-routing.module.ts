import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentMethodRequestDetailsComponent } from './payment-method-request-details.component'

const routes: Routes = [{ path: '', component: PaymentMethodRequestDetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentMethodRequestDetailsRoutingModule { }
