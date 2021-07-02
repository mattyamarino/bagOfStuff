import { ViewChild } from '@angular/core';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MonetaryTransaction } from '../models/MonetaryTransaction';

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
    'createdBy',
    'createdOn',
    'description'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.data = this.currencyTransactions;
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog) { 
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
}
