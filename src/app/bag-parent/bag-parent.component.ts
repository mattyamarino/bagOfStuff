import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from '../models/user';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TransactionModalComponent } from '../transaction-modal/transaction-modal.component';
import { UserComponent } from '../user/user.component';
import { MonetaryTransaction } from '../models/MonetaryTransaction';
import { FirestoreConstants } from '../config/FirestoreConstants';

@Component({
  selector: 'app-bag-parent',
  templateUrl: './bag-parent.component.html',
  styleUrls: ['./bag-parent.component.css']
})
export class BagParentComponent implements OnInit {
  currencyTransactions: MonetaryTransaction[] = [];
  users: User[] = [];
  latestTransaction!: MonetaryTransaction;
  loading!: boolean;
  userLoading!: boolean;
  currencyLoading!: boolean;
  @ViewChild("user", { static: false }) userComponent?: UserComponent;
  tempNumber: number = 0;

  constructor(private firestore: AngularFirestore, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.loading = true;
    this.getCurrencyTotals();
    this.getUsers();
  }

  getCurrencyTotals(): void {
    this.currencyLoading = true;
    this.firestore.collection(FirestoreConstants.currencyTransactions).valueChanges().subscribe(res => {
      this.currencyTransactions = <MonetaryTransaction[]>res;
      this.getLatestTransaction();
      this.calculateTotalValueInSilver();
      this.currencyLoading = false;
      this.checkLoading();
    });
  }

  getUsers(): void {
    this.userLoading = true;
    this.firestore.collection("users").valueChanges().subscribe(res => {
      this.users = <User[]>res;
      this.userLoading = false;
      this.checkLoading();
    });
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkLoading(): Promise<void> {
    // await this.delay(3000);
    if (!this.userLoading && !this.currencyLoading) {
      this.loading = false;
    }
  }

  getLatestTransaction(): void {
    if(this.currencyTransactions.length === 0) {
      let transaction: MonetaryTransaction = new MonetaryTransaction;
      transaction.platinumTotal = 0;
      transaction.electrumTotal = 0;
      transaction.silverTotal = 0;
      transaction.copperTotal = 0;
      transaction.goldTotal = 0;
      this.latestTransaction = transaction;
    } else {
      this.currencyTransactions.sort(function(x, y){
        return x.createdOn - y.createdOn;
      });
      this.latestTransaction = this.currencyTransactions[this.currencyTransactions.length -1];
    }
  }

  calculateTotalValueInSilver(): void {
    this.latestTransaction.totalValueInSilver = (this.latestTransaction.platinumTotal * 100);
    this.latestTransaction.totalValueInSilver += (this.latestTransaction.electrumTotal * 50);
    this.latestTransaction.totalValueInSilver += this.latestTransaction.silverTotal;
    this.latestTransaction.totalValueInSilver += (this.latestTransaction.copperTotal / 10);
    this.latestTransaction.totalValueInSilver += (this.latestTransaction.goldTotal / 10);
  }

  openDepositDialog(): void {
    this.dialog.open(TransactionModalComponent, 
      {
        data: {
          latestTransaction: this.latestTransaction, 
          selectedUser: this.userComponent?.selectedUser,
          type: "Deposit"
        }
      });
  }

  openWithdrawDialog(): void {
    this.dialog.open(TransactionModalComponent, 
      {
        data: {
          latestTransaction: this.latestTransaction, 
          selectedUser: this.userComponent?.selectedUser,
          type: "Withdraw"
        }
      });
  }

  openMonetaryHistoryDialog(): void {

  }

  switchUser(): void {
    if(this.userComponent?.selectedUser) {
      this.userComponent.selectedUser = undefined;
    }
  }
}
