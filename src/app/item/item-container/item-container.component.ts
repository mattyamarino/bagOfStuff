import { Input } from '@angular/core';
import { Component, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Item } from 'src/app/models/Item';
import { ItemTransactionModalComponent } from '../item-transaction-modal/item-transaction-modal.component';

@Component({
  selector: 'app-item-container',
  templateUrl: './item-container.component.html',
  styleUrls: ['./item-container.component.css']
})
export class ItemContainerComponent implements OnInit {
  @Input() user!: string;

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openDepositDialog(): void {
    this.dialog.open(ItemTransactionModalComponent, {
      data: {
        user: this.user,
        createdFor: "bank"
      }
    });
  }
  
  openHistoryDialog(): void {

  }
}
