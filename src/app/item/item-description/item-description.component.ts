import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItemHistory } from 'src/app/models/ItemHistory';
import { FirestoreService } from 'src/app/services/firestore/firestore.service';
import { ItemService } from 'src/app/services/item/item.service';
import { ItemHistoryComponent } from '../item-history/item-history.component';

@Component({
  selector: 'app-item-description',
  templateUrl: './item-description.component.html',
  styleUrls: ['./item-description.component.css']
})
export class ItemDescriptionComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ItemDescriptionComponent>, @Inject(MAT_DIALOG_DATA) public data: any, 
              public itemService: ItemService, public firestoreService: FirestoreService, public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  getItemIcon(type: string): string {
    return type.split(" ")[0].toLowerCase();
  }

  openHistoryDialog(): void {
    let queryDate = new Date(new Date().setDate(new Date().getDate() - 30)).getTime();
    this.firestoreService.getItemHistoriesForItem(queryDate, this.data.item.id).subscribe(res => {
      const histories = <ItemHistory[]>res.docs.map(doc => doc.data())
      this.itemService.sortItemsHistoryDescendingByLastUpdatedOn(histories)
      this.dialog.open(ItemHistoryComponent, {
        data: {
          target: "item",
          histories: histories,
          item: this.data.item
        }
      });
    });
  }
}
