import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PadresRpaNoProcesadoComponent } from './padres-rpa-no-procesado.component';

const routes: Routes = [{ path: '', component: PadresRpaNoProcesadoComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PadresRpaNoProcesadoRoutingModule {}
