import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from '../models/user';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TransactionModalComponent } from '../transaction-modal/transaction-modal.component';
import { UserComponent } from '../user/user.component';
import { MonetaryTransaction } from '../models/MonetaryTransaction';
import { FirestoreConstants } from '../config/FirestoreConstants';
import { FirestoreService } from '../services/firestore.service';
import { MonetaryHistoryComponent } from '../monetary-history/monetary-history.component';

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

  constructor(private firestoreService: FirestoreService,  public dialog: MatDialog) { }

  ngOnInit(): void {
    this.loading = true;
    this.getCurrencyTotals();
    this.getUsers();
  }

  getCurrencyTotals(): void {
    this.currencyLoading = true;
      this.firestoreService.getCurrencyTransactions().subscribe(res => {
      this.currencyTransactions = <MonetaryTransaction[]>res;
      this.latestTransaction = this.firestoreService.getLatestTransaction(this.currencyTransactions);
      this.firestoreService.calculateTotalValueInSilver(this.latestTransaction);
      this.currencyLoading = false;
      this.checkLoading();
    });
  }

  getUsers(): void {
    this.userLoading = true;
    this.firestoreService.getUsers().subscribe(res => {
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
    this.dialog.open(MonetaryHistoryComponent, 
      {
        data: {
          currencyTransactions: this.currencyTransactions
        }
      });
  }

}
