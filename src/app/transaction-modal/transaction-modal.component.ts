import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-transaction-modal',
  templateUrl: './transaction-modal.component.html',
  styleUrls: ['./transaction-modal.component.css']
})
export class TransactionModalComponent implements OnInit {
  displayedColumns: string[] = ['currency', 'transactionAmount'];
  dataSource: any = [];  
  constructor() { }

  ngOnInit(): void {
   this.populateColumns();
  }

  populateColumns(): void {
    this.dataSource.push({
      currency: 'Platinum', transactionAmount: 0
    });
    this.dataSource.push({
      currency: 'Electrum', transactionAmount: 0
    });
    this.dataSource.push({
      currency: 'Silver', transactionAmount: 0
    });
    this.dataSource.push({
      currency: 'Copper', transactionAmount: 0
    });
    this.dataSource.push({
      currency: 'Gold', transactionAmount: 0
    });
   
  }


}
