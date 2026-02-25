import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGenderComponent } from './modal-gender.component';

describe('ModalGenderComponent', () => {
  let component: ModalGenderComponent;
  let fixture: ComponentFixture<ModalGenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalGenderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalGenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
