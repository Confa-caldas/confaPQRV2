import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatesDataDetailsComponent } from './updates-data-details.component';

describe('UpdatesDataDetailsComponent', () => {
  let component: UpdatesDataDetailsComponent;
  let fixture: ComponentFixture<UpdatesDataDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdatesDataDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdatesDataDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
