import { Component, Inject, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FirestoreConstants } from '../config/FirestoreConstants';
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
  type!: string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private firestore: AngularFirestore, public dialog: MatDialog) {
      this.latestTransaction = data.latestTransaction;
      this.selectedUser = data.selectedUser;
      this.type = data.type;
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
    if(this.type === "Withdraw") {
      return (currentTotal - amount) < 0;
    } 
    return amount < 0;
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
      if(this.type === "Withdraw") {
        transaction.platinumTotal = this.latestTransaction.platinumTotal - adjustmentAmount;
      } else {
        transaction.platinumTotal = this.latestTransaction.platinumTotal + adjustmentAmount;
      }
    }
    if(currency === "Electrum") {
      transaction.electrumDeposited = adjustmentAmount;
      if(this.type === "Withdraw") {
        transaction.electrumTotal = this.latestTransaction.electrumTotal - adjustmentAmount;
      } else {
        transaction.electrumTotal = this.latestTransaction.electrumTotal + adjustmentAmount;
      }
    }
    if(currency === "Silver") {
      transaction.silverDeposited = adjustmentAmount;
      if(this.type === "Withdraw") {
        transaction.silverTotal = this.latestTransaction.silverTotal - adjustmentAmount;
      } else {
        transaction.silverTotal = this.latestTransaction.silverTotal + adjustmentAmount;
      }
    }
    if(currency === "Copper") {
      transaction.copperDeposited = adjustmentAmount;
      if(this.type === "Withdraw") {
        transaction.copperTotal = this.latestTransaction.copperTotal - adjustmentAmount;
      } else {
        transaction.copperTotal = this.latestTransaction.copperTotal + adjustmentAmount;
      }
    }
    if(currency === "Gold") {
      transaction.goldDeposited = adjustmentAmount;
      if(this.type === "Withdraw") {
        transaction.goldTotal = this.latestTransaction.goldTotal - adjustmentAmount;
      } else {
        transaction.goldTotal = this.latestTransaction.goldTotal + adjustmentAmount;
      }
    }
  }

  async completeTransaction() {

    let newTransaction: MonetaryTransactionDTO = new MonetaryTransactionDTO;

    newTransaction.createdOn = Date.now();
    newTransaction.description = this.description;
    newTransaction.createdBy = this.selectedUser;
    
    this.dataSource.forEach((element: { currency: string; transactionAmount: number; }) => {
      this.getTransactionTotalForCurrencyType(element.currency, newTransaction, element.transactionAmount);
    });

    const data = Object.assign({}, newTransaction);

    return new Promise<any>((resolve, reject) =>{
      this.firestore
          .collection(FirestoreConstants.currencyTransactions)
          .add(data)
          .then(res => {}, err => reject(err));
          this.dialog.closeAll();
        });
  }




}
