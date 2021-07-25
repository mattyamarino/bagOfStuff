import { TitleCasePipe } from '@angular/common';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ItemActions } from 'src/app/config/ItemConstants';
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
    // 'action', 
    'history', 
    'createdBy',
    'createdOn'
  ];
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, public titleCasePipe: TitleCasePipe, public itemService: ItemService, public firestoreService: FirestoreService) { }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.data = this.data.histories;
  }

  getTitle(): string {
    return this.data.target === "item" ? this.data.item.itemName : this.data.target === "player" ? this.data.user.short + "'s Items" : "All Items"
  }

  openItemDescription(itemHistory: ItemHistory, openParentItemHistory?: boolean): void {
    if(openParentItemHistory) {
      this.goToParentItem(itemHistory);
    } else {
      if(this.data.item === undefined) {
        this.firestoreService.getItem(itemHistory.itemId).subscribe(res => {
          this.openModal(<Item>res.data());
        });
      } else {
        this.openModal(this.data.item);
      }
    }
  }

  openModal(item: Item): void {
    this.dialog.open(ItemDescriptionComponent, {
      data: {
        item: item,
        hideHistory: true
      }
    });
  }

  getTransactionDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString("en-us")
  }

  showParagraph(itemHistory: ItemHistory): boolean {
    return itemHistory.origin !== undefined
  }

  showGrid(itemHistory: ItemHistory): boolean {
    return itemHistory.previousQuantity !== undefined || itemHistory.previousCost !== undefined || itemHistory.previousOwner !== undefined 
  }

  getBeforeAction(itemHistory: ItemHistory): string {
    let stringArray = [];
    let beforeAction = "";
    let counter = 1;
    if(itemHistory.previousOwner !== undefined && this.isOwnerShown(itemHistory)) {
      stringArray.push("Owner:  " + itemHistory.previousOwner);
    }
    if(itemHistory.previousQuantity !== undefined) {
      stringArray.push("Qty:  " + itemHistory.previousQuantity);
    }
    if(itemHistory.previousCost !== undefined) {
      stringArray.push("Value:  " + itemHistory.previousCost + "sp");
    }
    stringArray.forEach(string => {
      beforeAction += string;
      if(counter < stringArray.length) {
        beforeAction += ",  ";
      }
      counter++;
    });
    return beforeAction;
  }

  getAfterAction(itemHistory: ItemHistory): string {
    let stringArray = [];
    let afterAction = "";
    let counter = 1;
    if(itemHistory.currentOwner !== undefined && this.isOwnerShown(itemHistory)) {
      stringArray.push("Owner:  " + itemHistory.currentOwner);
    }
    if(itemHistory.currentQuantity !== undefined) {
      stringArray.push("Qty:  " + itemHistory.currentQuantity);
    }
    if(itemHistory.currentCost !== undefined) {
      stringArray.push("Value:  " + itemHistory.currentCost + "sp");
    }
    stringArray.forEach(string => {
      afterAction += string;
      if(counter < stringArray.length) {
        afterAction += ',  ';
      }
      counter++;
    });
    return afterAction;
  }

  getArrowIcon(itemHistory: ItemHistory): string {
    return itemHistory.action === "deleted" ? "arrow-orange" : itemHistory.action === "sold" ? "arrow-pink" : "arrow-blue";
  }

  getOrigin(itemHistory: ItemHistory): string {
    if(itemHistory.action === "created") {
      return itemHistory.origin!
    }

    return "Moved from stack in another vault, click here for the parent item's history"
  }

  isOwnerShown(itemHistory: ItemHistory): boolean {
    return itemHistory.action !== "deleted" && itemHistory.action !== "sold" && itemHistory.previousOwner !== itemHistory.currentOwner;
  }

  goToParentItem(itemHistory: ItemHistory): void {
    this.dataSource.data = this.data.histories;
    this.firestoreService.getItemHistoriesForItem(itemHistory.origin!).subscribe(resHistories => {
      const histories = <ItemHistory[]>resHistories.docs.map(doc => doc.data())
      this.firestoreService.getItem(itemHistory.origin!).subscribe(resItem => {
        this.data.user = undefined;
        this.data.item = resItem.data();
        this.data.target = "item"
        this.data.histories = histories;
        this.dataSource.data = histories;
        console.log(this.data)
      });
    });
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }
}
