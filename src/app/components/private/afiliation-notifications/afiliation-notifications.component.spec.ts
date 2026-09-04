import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfiliationNotificationsComponent } from './afiliation-notifications.component';

describe('AfiliationNotificationsComponent', () => {
  let component: AfiliationNotificationsComponent;
  let fixture: ComponentFixture<AfiliationNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AfiliationNotificationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AfiliationNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
