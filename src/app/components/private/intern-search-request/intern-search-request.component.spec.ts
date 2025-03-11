import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternSearchRequestComponent } from './intern-search-request.component';

describe('InternSearchRequestComponent', () => {
  let component: InternSearchRequestComponent;
  let fixture: ComponentFixture<InternSearchRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InternSearchRequestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InternSearchRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
