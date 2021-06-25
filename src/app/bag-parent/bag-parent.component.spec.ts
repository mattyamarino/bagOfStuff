import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BagParentComponent } from './bag-parent.component';

describe('BagParentComponent', () => {
  let component: BagParentComponent;
  let fixture: ComponentFixture<BagParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BagParentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BagParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
