import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMaritalStatusComponent } from './modal-marital-status.component';

describe('ModalMaritalStatusComponent', () => {
  let component: ModalMaritalStatusComponent;
  let fixture: ComponentFixture<ModalMaritalStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalMaritalStatusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalMaritalStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
