import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchRequestExternalComponent } from './search-request-external.component';

describe('SearchRequestExternalComponent', () => {
  let component: SearchRequestExternalComponent;
  let fixture: ComponentFixture<SearchRequestExternalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchRequestExternalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchRequestExternalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
