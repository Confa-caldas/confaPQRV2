import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSystemVariableComponent } from './modal-system-variable.component';

describe('ModalSystemVariableComponent', () => {
  let component: ModalSystemVariableComponent;
  let fixture: ComponentFixture<ModalSystemVariableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalSystemVariableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalSystemVariableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
