import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemTransactionModalComponent } from './item-transaction-modal.component';

describe('ItemTransactionModalComponent', () => {
  let component: ItemTransactionModalComponent;
  let fixture: ComponentFixture<ItemTransactionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemTransactionModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemTransactionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
