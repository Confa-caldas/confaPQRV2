import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAccountTypeComponent } from './modal-account-type.component';

describe('ModalAccountTypeComponent', () => {
  let component: ModalAccountTypeComponent;
  let fixture: ComponentFixture<ModalAccountTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalAccountTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalAccountTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
