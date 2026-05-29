import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalReasonAccountUpdateComponent } from './modal-reason-account-update.component';

describe('ModalReasonAccountUpdateComponent', () => {
  let component: ModalReasonAccountUpdateComponent;
  let fixture: ComponentFixture<ModalReasonAccountUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalReasonAccountUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalReasonAccountUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
