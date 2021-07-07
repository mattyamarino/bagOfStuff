import { ViewChild } from '@angular/core';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MonetaryTransaction } from '../models/MonetaryTransaction';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-monetary-history',
  templateUrl: './monetary-history.component.html',
  styleUrls: ['./monetary-history.component.css']
})
export class MonetaryHistoryComponent implements OnInit {
  currencyTransactions!: MonetaryTransaction[];
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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.data = this.currencyTransactions;
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, public firestoreService: FirestoreService) { 
    this.currencyTransactions = data.currencyTransactions;
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
}
