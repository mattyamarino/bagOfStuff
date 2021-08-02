import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItemHistory } from 'src/app/models/ItemHistory';
import { FirestoreService } from 'src/app/services/firestore/firestore.service';
import { ItemService } from 'src/app/services/item/item.service';
import { ItemHistoryComponent } from '../item-history/item-history.component';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { ItemConstants } from 'src/app/config/ItemConstants';

@Component({
  selector: 'app-item-description',
  templateUrl: './item-description.component.html',
  styleUrls: ['./item-description.component.css']
})
export class ItemDescriptionComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ItemDescriptionComponent>, @Inject(MAT_DIALOG_DATA) public data: any, 
              public itemService: ItemService, public firestoreService: FirestoreService, public dialog: MatDialog,
              private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) { }

  ngOnInit(): void {
    console.log(this.data)
  }

  getItemIcon(type: string): string {
    return type.split(" ")[0].toLowerCase();
  }

  openHistoryDialog(): void {
    this.firestoreService.getItemHistoriesForItem(this.data.item.id, this.data.userId).subscribe(res => {
      const histories = <ItemHistory[]>res.docs.map(doc => doc.data())
      this.itemService.sortItemsHistoryDescendingByLastUpdatedOn(histories)
      this.dialog.open(ItemHistoryComponent, {
        data: {
          target: "item",
          histories: histories,
          item: this.data.item,
          user: this.data.user
        }
      });
    });
  }

  setIcons(): void {
    ItemConstants.itemTypes.forEach(type => {
      this.matIconRegistry.addSvgIcon(
        type.split(" ")[0],
        this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/" + type.split(" ")[0] + ".svg")
      );
    });
  }
}
