import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAfiliationNotificationComponent } from './modal-afiliation-notification.component';

describe('ModalAfiliationNotificationComponent', () => {
  let component: ModalAfiliationNotificationComponent;
  let fixture: ComponentFixture<ModalAfiliationNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalAfiliationNotificationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalAfiliationNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
