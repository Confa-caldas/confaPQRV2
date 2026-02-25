import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRelationshipComponent } from './modal-relationship.component';

describe('ModalRelationshipComponent', () => {
  let component: ModalRelationshipComponent;
  let fixture: ComponentFixture<ModalRelationshipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalRelationshipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalRelationshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
