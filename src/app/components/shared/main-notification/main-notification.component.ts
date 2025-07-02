import { Component, Input, ElementRef, HostListener} from '@angular/core';
import { Router } from '@angular/router';
import { RoutesApp } from '../../../enums/routes.enum';

@Component({
  selector: 'app-main-notification',
  templateUrl: './main-notification.component.html',
  styleUrl: './main-notification.component.scss'
})

export class MainNotificationComponent{
  @Input() requestListByAssigned: any[] = [];
  isOpen = true;

  constructor(private router: Router,
    private eRef: ElementRef
  ){}

  redirectDetails(request_id: number) {
    this.router.navigateByUrl('/process-request', { skipLocationChange: true }).then(() => {
      this.router.navigate([RoutesApp.REQUEST_DETAILS, request_id]);
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false; // Oculta el panel si se hace clic fuera
    }
  }

  toggleNotifications() {
    this.isOpen = !this.isOpen;
  }
}

