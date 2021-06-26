import { Component, Inject, Input, OnInit } from '@angular/core';
import { CurrencyTransaction } from '../models/currencyTransaction';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-transaction-modal',
  templateUrl: './transaction-modal.component.html',
  styleUrls: ['./transaction-modal.component.css']
})
export class TransactionModalComponent implements OnInit {
  currencyTransactions!: CurrencyTransaction[];
  latestTransaction!: CurrencyTransaction;
  displayedColumns: string[] = ['currency', 'transactionAmount', 'currentAmount', 'valueInSilver'];
  dataSource: any = [];  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
      this.latestTransaction = data.latestTransaction;
   }

  ngOnInit(): void {
   this.populateColumns();
  }

  populateColumns(): void {
    this.dataSource.push({
      currency: 'Platinum', transactionAmount: 0, valueInSilver: '100sp', currentAmount: this.latestTransaction.platinumTotal
    });
    this.dataSource.push({
      currency: 'Electrum', transactionAmount: 0, valueInSilver: '50sp', currentAmount: this.latestTransaction.electrumTotal
    });
    this.dataSource.push({
      currency: 'Silver', transactionAmount: 0, valueInSilver: '1sp', currentAmount: this.latestTransaction.silverTotal
    });
    this.dataSource.push({
      currency: 'Copper', transactionAmount: 0, valueInSilver: '0.1sp', currentAmount: this.latestTransaction.copperTotal
    });
    this.dataSource.push({
      currency: 'Gold', transactionAmount: 0, valueInSilver: '0.1sp', currentAmount: this.latestTransaction.goldTotal
    });
  }

  isInvalidAmount(currency: string, amount: number): boolean {
    let currentTotal: number = this.getTotalForCurrencyType(currency);
    return (currentTotal - amount) < 0;
  }

  getTotalForCurrencyType(currency: string): number {
    switch(currency) {
      case "Platinum": 
        return this.latestTransaction.platinumTotal;
      case "Electrum": 
        return this.latestTransaction.electrumTotal;
      case "Silver": 
        return this.latestTransaction.silverTotal;
      case "Copper": 
        return this.latestTransaction.copperTotal;
      case "Gold": 
        return this.latestTransaction.goldTotal;
      default: 
        return 0;
    }
  }



}
