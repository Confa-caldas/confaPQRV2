import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchRequestInternalComponent } from './search-request-internal.component';

describe('SearchRequestInternalComponent', () => {
  let component: SearchRequestInternalComponent;
  let fixture: ComponentFixture<SearchRequestInternalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchRequestInternalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchRequestInternalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
