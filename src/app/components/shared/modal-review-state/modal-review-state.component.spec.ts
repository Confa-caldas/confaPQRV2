import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalReviewStateComponent } from './modal-review-state.component';

describe('ModalReviewStateComponent', () => {
  let component: ModalReviewStateComponent;
  let fixture: ComponentFixture<ModalReviewStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalReviewStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalReviewStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
