import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from '../models/user';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TransactionModalComponent } from '../transaction-modal/transaction-modal.component';
import { UserComponent } from '../user/user.component';
import { MonetaryTransaction } from '../models/MonetaryTransaction';

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
  dialogRef!: MatDialogRef<TransactionModalComponent>;
  tempNumber: number = 0;

  constructor(private firestore: AngularFirestore, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.loading = true;
    this.getCurrencyTotals();
    this.getUsers();
  }

  getCurrencyTotals(): void {
    this.currencyLoading = true;
    this.firestore.collection("currency-transactions").valueChanges().subscribe(res => {
      this.currencyTransactions = <MonetaryTransaction[]>res;
      this.latestTransaction = this.currencyTransactions[this.currencyTransactions.length - 1];
      this.calculateTotalValueInSilver();
      this.currencyLoading = false;
      this.checkLoading();
      if(this.dialogRef && this.dialogRef.componentInstance){
        this.dialogRef.componentInstance.data = {
          latestTransaction: this.latestTransaction,
          selectedUser: this.userComponent?.selectedUser
        };
      }
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
    await this.delay(3000);
    if (!this.userLoading && !this.currencyLoading) {
      this.loading = false;
    }
  }

  calculateTotalValueInSilver(): void {
    this.latestTransaction.totalValueInSilver = (this.latestTransaction.platinumTotal * 100);
    this.latestTransaction.totalValueInSilver += (this.latestTransaction.electrumTotal * 50);
    this.latestTransaction.totalValueInSilver += this.latestTransaction.silverTotal;
    this.latestTransaction.totalValueInSilver += (this.latestTransaction.copperDeposited / 10);
    this.latestTransaction.totalValueInSilver += (this.latestTransaction.goldTotal / 10);
  }

  openTransactionDialog() {
  
    this.dialogRef = this.dialog.open(TransactionModalComponent, 
      {data: {latestTransaction: this.latestTransaction, selectedUser: this.userComponent?.selectedUser}});
  }
}
