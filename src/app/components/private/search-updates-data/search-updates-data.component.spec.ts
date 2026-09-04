import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchUpdatesDataComponent } from './search-updates-data.component';

describe('SearchUpdatesDataComponent', () => {
  let component: SearchUpdatesDataComponent;
  let fixture: ComponentFixture<SearchUpdatesDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchUpdatesDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchUpdatesDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
