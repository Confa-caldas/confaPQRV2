import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEntityAccountTypeComponent } from './modal-entity-account-type.component';

describe('ModalEntityAccountTypeComponent', () => {
  let component: ModalEntityAccountTypeComponent;
  let fixture: ComponentFixture<ModalEntityAccountTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalEntityAccountTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalEntityAccountTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
