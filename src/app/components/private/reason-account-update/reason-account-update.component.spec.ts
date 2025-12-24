import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReasonAccountUpdateComponent } from './reason-account-update.component';

describe('ReasonAccountUpdateComponent', () => {
  let component: ReasonAccountUpdateComponent;
  let fixture: ComponentFixture<ReasonAccountUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReasonAccountUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReasonAccountUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
