import { ViewChild } from '@angular/core';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FirestoreService } from 'src/app/services/firestore/firestore.service';
import { MonetaryTransaction } from '../../models/MonetaryTransaction';

@Component({
  selector: 'app-monetary-history',
  templateUrl: './monetary-history.component.html',
  styleUrls: ['./monetary-history.component.css']
})
export class MonetaryHistoryComponent implements OnInit {
  currencyTransactions!: MonetaryTransaction[];
  selectedDate: Date =new Date(new Date().setDate(new Date().getDate()-30));
  originalDate: Date = this.selectedDate;
  dataSource = new MatTableDataSource<MonetaryTransaction>([]);
  displayedColumns: string[] = [
    'type', 
    'platinumDeposited', 
    'electrumDeposited', 
    'silverDeposited',
    'copperDeposited',
    'goldDeposited',
    'totalValueInSilver',
    'createdBy',
    'createdOn',
    'description'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, public firestoreService: FirestoreService) { 
    this.currencyTransactions = data.currencyTransactions;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.data = this.currencyTransactions;
  }

  ngOnInit(): void {

  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  getTransactionDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString("en-us")
  }
  
  getTransactionSymbol(type: string): string {
    return type === "Withdraw"? "-" : "+";
  }

  getTotalValueInSilver(transaction: MonetaryTransaction): number {
    this.firestoreService.calculateTransactionValueInSilver(transaction);
    return transaction.totalValueInSilver ? transaction.totalValueInSilver : 0;
  }

  updateTransactions(): void {
    if(this.selectedDate) {
      this.firestoreService.getCurrencyTransactions(this.selectedDate.getTime()).subscribe(res => {
        const refArray =  res.docs.map(doc => doc.data());
        this.firestoreService.sortTransactionsDescendingByDate(<MonetaryTransaction[]>refArray);
        this.dataSource.data = <MonetaryTransaction[]>refArray;
      });
    }
  }

  isDateUnchanged() {
    return this.selectedDate == this.originalDate;
  }
}
