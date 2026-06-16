import { Component, Input, Output, EventEmitter, ElementRef, HostListener} from '@angular/core';
import { Router } from '@angular/router';
import { RoutesApp } from '../../../enums/routes.enum';
import { RpaAfiInconsistencyListItem } from '../../../models/users.interface';

export type NotificationSection = 'pqr' | 'rpa';

@Component({
  selector: 'app-main-notification',
  templateUrl: './main-notification.component.html',
  styleUrl: './main-notification.component.scss'
})

export class MainNotificationComponent{
  @Input() requestListByAssigned: any[] = [];
  @Input() rpaInconsistencyList: RpaAfiInconsistencyListItem[] = [];
  @Output() closed = new EventEmitter<void>();

  activeSection: NotificationSection = 'pqr';
  isOpen = true;

  constructor(private router: Router,
    private eRef: ElementRef
  ){}

  setSection(section: NotificationSection): void {
    this.activeSection = section;
  }

  redirectDetails(request_id: number) {
    this.closed.emit();
    this.router.navigateByUrl('/process-request', { skipLocationChange: true }).then(() => {
      this.router.navigate([RoutesApp.REQUEST_DETAILS, request_id]);
    });
  }

  redirectAfiliationDetails(request_id: number) {
    this.closed.emit();
    this.router.navigate([RoutesApp.REQUEST_DETAILS_AFILIATION, request_id]);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleNotifications() {
    this.isOpen = !this.isOpen;
  }
}

