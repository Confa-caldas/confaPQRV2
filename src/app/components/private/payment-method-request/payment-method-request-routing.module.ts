import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentMethodRequestComponent } from './payment-method-request.component';

const routes: Routes = [{ path: '', component: PaymentMethodRequestComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentMethodRequestRoutingModule { }
