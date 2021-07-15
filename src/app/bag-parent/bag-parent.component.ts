import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from '../models/user';
import { MatDialog } from '@angular/material/dialog';
import { TransactionModalComponent } from '../coin/transaction-modal/transaction-modal.component';
import { UserComponent } from '../user/user.component';
import { MonetaryTransaction } from '../models/MonetaryTransaction';
import { MonetaryHistoryComponent } from '../coin/monetary-history/monetary-history.component';
import { FirestoreService } from '../services/firestore/firestore.service';
import { UserConstants } from '../config/UserConstants';

@Component({
  selector: 'app-bag-parent',
  templateUrl: './bag-parent.component.html',
  styleUrls: ['./bag-parent.component.css']
})
export class BagParentComponent implements OnInit {
  users: User[] = [];
  latestTransaction!: MonetaryTransaction;
  loading!: boolean;
  userLoading!: boolean;
  currencyLoading!: boolean;
  @ViewChild("user", { static: false }) userComponent?: UserComponent;
  tempNumber: number = 0;

  constructor(private firestoreService: FirestoreService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.loading = true;
    this.getCurrencyTotals();
    this.getUsers();
  }

  getCurrencyTotals(): void {
    this.currencyLoading = true;
    this.firestoreService.getLatestTransaction().subscribe(res => {
      const resArray = <MonetaryTransaction[]>res;
      this.latestTransaction = resArray[0];
      this.firestoreService.calculateTotalValueInSilver(this.latestTransaction);
      this.currencyLoading = false;
    });
  }

  getUsers(): void {
    this.userLoading = true;
    this.firestoreService.getUsers().subscribe(async res => {
      this.users = <User[]>res;
      await this.delay(1200);
      this.userLoading = false;
    });
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

   checkLoading(): boolean {
    if (!this.userLoading && !this.currencyLoading) {
      return false;
    }
    return true;
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
    let queryDate = new Date(new Date().setDate(new Date().getDate()-30)).getTime();
    
    this.firestoreService.getCurrencyTransactions(queryDate).subscribe(res => {
      const refArray =  res.docs.map(doc => doc.data());
      this.firestoreService.sortTransactionsDescendingByDate(<MonetaryTransaction[]>refArray);
      this.dialog.open(MonetaryHistoryComponent, {
        data: {
          currencyTransactions: refArray
        }
      });
    });
  }

  getDM(): string {
    return UserConstants.DM
  }

}
