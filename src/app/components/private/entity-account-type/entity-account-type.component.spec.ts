import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityAccountTypeComponent } from './entity-account-type.component';

describe('EntityAccountTypeComponent', () => {
  let component: EntityAccountTypeComponent;
  let fixture: ComponentFixture<EntityAccountTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntityAccountTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EntityAccountTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
