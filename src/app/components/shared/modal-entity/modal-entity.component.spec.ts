import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEntityComponent } from './modal-entity.component';

describe('ModalEntityComponent', () => {
  let component: ModalEntityComponent;
  let fixture: ComponentFixture<ModalEntityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalEntityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
