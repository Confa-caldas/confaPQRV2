import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfiliationOccupationsComponent } from './afiliation-occupations.component';

describe('AfiliationOccupationsComponent', () => {
  let component: AfiliationOccupationsComponent;
  let fixture: ComponentFixture<AfiliationOccupationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AfiliationOccupationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AfiliationOccupationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
