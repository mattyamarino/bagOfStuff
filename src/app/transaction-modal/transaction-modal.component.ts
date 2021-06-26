import { Component, Inject, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MonetaryTransaction } from '../models/MonetaryTransaction';
import { MonetaryTransactionDTO } from '../models/MonetaryTransactionDTO';

@Component({
  selector: 'app-transaction-modal',
  templateUrl: './transaction-modal.component.html',
  styleUrls: ['./transaction-modal.component.css']
})
export class TransactionModalComponent implements OnInit {
  currencyTransactions!: MonetaryTransaction[];
  latestTransaction!: MonetaryTransaction;
  displayedColumns: string[] = ['currency', 'transactionAmount', 'currentAmount', 'valueInSilver'];
  dataSource: any = [];  
  description: string = "";
  selectedUser!: string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private firestore: AngularFirestore, public dialog: MatDialog) {
      this.latestTransaction = data.latestTransaction;
      this.selectedUser = data.selectedUser;
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
    return (currentTotal + amount) < 0;
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

  getTransactionTotalForCurrencyType(currency: string, transaction: any, adjustmentAmount: number): void {
    if(currency === "Platinum") {
      transaction.platinumDeposited = adjustmentAmount;
      transaction.platinumTotal = adjustmentAmount + this.latestTransaction.platinumTotal;
    }
    if(currency === "Electrum") {
      transaction.electrumDeposited = adjustmentAmount;
      transaction.electrumTotal = adjustmentAmount + this.latestTransaction.electrumTotal;
    }
    if(currency === "Silver") {
      transaction.silverDeposited = adjustmentAmount;
      transaction.silverTotal = adjustmentAmount + this.latestTransaction.silverTotal;
    }
    if(currency === "Copper") {
      transaction.copperDeposited = adjustmentAmount;
      transaction.copperTotal = adjustmentAmount + this.latestTransaction.copperTotal;
    }
    if(currency === "Gold") {
      transaction.goldDeposited = adjustmentAmount;
      transaction.goldTotal = adjustmentAmount + this.latestTransaction.goldTotal;
    }
  }

  async completeTransaction() {

    let newTransaction: MonetaryTransactionDTO = new MonetaryTransactionDTO;

    newTransaction.description = this.description;
    newTransaction.createdBy = this.selectedUser;
    
    this.dataSource.forEach((element: { currency: string; transactionAmount: number; }) => {
      this.getTransactionTotalForCurrencyType(element.currency, newTransaction, element.transactionAmount);
    });

    const data = Object.assign({}, newTransaction);

    return new Promise<any>((resolve, reject) =>{
      this.firestore
          .collection("currency-transactions")
          .add(data)
          .then(res => {}, err => reject(err));
        });
  }




}
