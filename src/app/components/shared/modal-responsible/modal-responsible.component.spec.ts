import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalResponsibleComponent } from './modal-responsible.component';

describe('ModalResponsibleComponent', () => {
  let component: ModalResponsibleComponent;
  let fixture: ComponentFixture<ModalResponsibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalResponsibleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalResponsibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
