import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-layout-request',
  templateUrl: './layout-request.component.html',
  styleUrl: './layout-request.component.scss'
})
export class LayoutRequestComponent {
  isTestEnvironment = !environment.production;
}
