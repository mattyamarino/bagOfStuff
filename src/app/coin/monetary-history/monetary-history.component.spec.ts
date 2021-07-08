import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonetaryHistoryComponent } from './monetary-history.component';

describe('MonetaryHistoryComponent', () => {
  let component: MonetaryHistoryComponent;
  let fixture: ComponentFixture<MonetaryHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonetaryHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonetaryHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
