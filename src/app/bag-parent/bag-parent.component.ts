import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { User } from '../models/user';
import { MatDialog } from '@angular/material/dialog';
import { TransactionModalComponent } from '../coin/transaction-modal/transaction-modal.component';
import { UserComponent } from '../user/user.component';
import { MonetaryTransaction } from '../models/MonetaryTransaction';
import { MonetaryHistoryComponent } from '../coin/monetary-history/monetary-history.component';
import { FirestoreService } from '../services/firestore/firestore.service';
import { CoinService } from '../services/coin/coin.service';
import { UserService } from '../services/user/user.service';
@Component({
  selector: 'app-bag-parent',
  templateUrl: './bag-parent.component.html',
  styleUrls: ['./bag-parent.component.css']
})
export class BagParentComponent implements OnInit {
  users: User[] = [];
  latestTransaction!: MonetaryTransaction;
  @ViewChild("user", { static: false }) userComponent?: UserComponent;
  @ViewChild("money", { static: false }) moneyRef?: ElementRef;
  @ViewChild("items", { static: false }) itemRef?: ElementRef;
  maxHeight: number = 0;
  resized = false;
  constructor(private firestoreService: FirestoreService, public dialog: MatDialog, public coinService: CoinService, public userService: UserService) { }

  ngOnInit(): void {
    this.getCurrencyTotals();
    this.getUsers();
  }

  setCompenentSizes(): void {
    this.setScreenHeight();
    this.setBankWidths();
  }

  setScreenHeight(): void {
    if(document.body.scrollHeight > this.maxHeight) {this.maxHeight = document.body.scrollHeight}
    document.documentElement.style.setProperty('--documentHeight', this.maxHeight + "px");
  }

  setBankWidths(): void {
    document.documentElement.style.setProperty('--itemWidth', this.moneyRef?.nativeElement.clientWidth + "px");
  }

  getCurrencyTotals(): void {
    this.firestoreService.getLatestTransaction().subscribe(res => {
      this.latestTransaction = res[0] !== undefined ? <MonetaryTransaction>res[0] : this.coinService.buildEmptyMonertaryTransaction();
      this.coinService.calculateTotalValueInSilver(this.latestTransaction);

    });
  }

  getUsers(): void {
    this.firestoreService.getUsers().subscribe(async res => {
      this.userService.sortUsersByNameAsscending(<User[]>res);
      this.users = <User[]>res;
    });
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
    this.firestoreService.getCurrencyTransactions(this.userComponent?.selectedUser?.id!).subscribe(res => {
      const refArray = res.docs.map(doc => doc.data());
      this.coinService.sortTransactionsDescendingByDate(<MonetaryTransaction[]>refArray);
      this.dialog.open(MonetaryHistoryComponent, {
        data: {
          currencyTransactions: refArray,
          user: this.userComponent?.selectedUser
        }
      });
    });
  }

}
