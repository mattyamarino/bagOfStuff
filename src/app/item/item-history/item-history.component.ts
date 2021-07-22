import { TitleCasePipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Item } from 'src/app/models/Item';
import { ItemHistory } from 'src/app/models/ItemHistory';
import { FirestoreService } from 'src/app/services/firestore/firestore.service';
import { ItemService } from 'src/app/services/item/item.service';
import { ItemDescriptionComponent } from '../item-description/item-description.component';

@Component({
  selector: 'app-item-history',
  templateUrl: './item-history.component.html',
  styleUrls: ['./item-history.component.css']
})
export class ItemHistoryComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  selectedDate: Date =new Date(new Date().setDate(new Date().getDate()-30));
  originalDate: Date = this.selectedDate;
  dataSource = new MatTableDataSource<ItemHistory>([]);
  displayedColumns: string[] = [
    'name', 
    'action', 
    'history', 
    'createdBy',
    'createdOn'
  ];
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, public titleCasePipe: TitleCasePipe, public itemService: ItemService, public firestoreService: FirestoreService) { }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    console.log(this.data)
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.data = this.data.histories;
  }

  getTitle(): string {
    return this.data.target = this.data.target === "item" ? this.data.item.name : this.data.target === "player" ? this.data.user.short + "'s Items" : "All Items"
  }

  openItemDescription(itemId: string): void {
    if(this.data.item === undefined) {
      this.firestoreService.getItem(itemId).subscribe(res => {
        this.openModal(<Item>res.data());
      });
    } else {
      this.openModal(this.data.item);
    }
  }

  openModal(item: Item): void {
    console.log(item)
    this.dialog.open(ItemDescriptionComponent, {
      data: {
        item: item
      }
    });
  }

  getTransactionDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString("en-us")
  }

  getBeforeAction(itemHistory: ItemHistory): string {
    let action = "";
    action += itemHistory.previousOwner !== undefined ? itemHistory.previousOwner : "";
    action += action !== undefined ? ",  " : "";
    action += itemHistory.previousQuantity !== undefined ? "Qty: " + itemHistory.previousQuantity.toString() : "";
    return action;
  }

  getAfterAction(itemHistory: ItemHistory): string {
    let action = "";
    action += itemHistory.currentOwner !== undefined ? itemHistory.currentOwner : "";
    action += action !== "" ? ",  " : "";
    action += itemHistory.currentQuantity !== undefined ? "Qty:  " + itemHistory.currentQuantity.toString() : "";
    return action;
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }
}
