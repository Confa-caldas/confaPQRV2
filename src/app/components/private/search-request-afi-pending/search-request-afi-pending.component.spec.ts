import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchRequestAfiPendingComponent } from './search-request-afi-pending.component';

describe('SearchRequestAfiPendingComponent', () => {
  let component: SearchRequestAfiPendingComponent;
  let fixture: ComponentFixture<SearchRequestAfiPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchRequestAfiPendingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchRequestAfiPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
