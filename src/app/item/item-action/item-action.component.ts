import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItemActions } from 'src/app/config/ItemConstants';
import { Item } from 'src/app/models/Item';
import { ItemHistory } from 'src/app/models/ItemHistory';
import { FirestoreService } from 'src/app/services/firestore/firestore.service';
import { ItemService } from 'src/app/services/item/item.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-item-action',
  templateUrl: './item-action.component.html',
  styleUrls: ['./item-action.component.css']
})
export class ItemActionComponent implements OnInit {
  destinationLabel!: string;
  destination!: string;
  quantity: FormControl = new FormControl;

  constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<ItemActionComponent>, @Inject(MAT_DIALOG_DATA) public data: any, 
  private firestoreService: FirestoreService, public itemService: ItemService) { }

  ngOnInit(): void {
    this.setDestination();
    this.setQuantity();
  }

  setDestination(): void {
    this.destination = this.data.item.owner === "bank" ? this.data.user.character : this.data.action === "delete" ? "deleted" : "bank"
    this.destinationLabel = this.data.item.owner === "bank" ? this.data.user.short + "'s Item Vault" : "Party Item Vault";
  }

  setQuantity(): void {
    this.quantity.setValidators([Validators.required, Validators.min(1), Validators.max(this.data.item.quantity), Validators.pattern('^(0|[1-9][0-9]*)$')]);
    if(this.data.item.quantity === 1) {
      this.quantity.setValue(1);
    }
  }

  getTitle(): string {
    return this.data.action === "move" ? "Move Item(s)" : "Discard Item(s)";  
  }

  getMessage(): string {
    return this.data.action === "move" ? "Send to " + this.destinationLabel : "Remove due to being sold, consumed, stolen, etc..";
  }

  moveDeleteItem(): void {
    if(this.quantity.valid) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          confirm: "confirm",
          cancel: "go back",
          title: this.data.action + " " + this.quantity.value + " Item(s)?",
          message: ""
        }
      });
  
      dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult) {
          this.completeAction();
        }
      });
    }
  }

  completeAction(): void {
    this.firestoreService.getItem(this.data.item.id).subscribe(res => {
      const existingItem = <Item>res.data();
      if(existingItem.owner === this.data.item.owner && existingItem.quantity! >= this.data.item.quantity - this.quantity.value) {
        if(this.data.action === "delete" && existingItem.quantity === this.quantity.value) {
          this.firestoreService.updateItemOwnerAndQuantity(this.data.item.id, "deleted", this.data.item.quantity - this.quantity.value);
          this.firestoreService.createItemHistory(this.itemService.transformToObject(this.buildItemHistory("delete")), this.data.item.id);
        } else if (this.data.action === "delete") {
          this.firestoreService.updateItemQuantity(this.data.item.id, this.data.item.quantity - this.quantity.value);
          this.firestoreService.createItemHistory(this.itemService.transformToObject(this.buildItemHistory("delete")), this.data.item.id);
        } else if (existingItem.quantity === this.quantity.value) {
          this.firestoreService.updateItemOwner(this.data.item.id, this.destination);
          this.firestoreService.createItemHistory(this.itemService.transformToObject(this.buildItemHistory("owner")), this.data.item.id);
        } else {
          this.firestoreService.getItemsByNameTypeAndOwner(this.data.item.name, this.data.item.type, this.destination).subscribe(res => {
            const duplicateItem: Item = <Item>res.docs[0]?.data();
            const duplicateItemId = res.docs[0]?.id
            this.firestoreService.updateItemQuantity(this.data.item.id, this.data.item.quantity - this.quantity.value);
            this.firestoreService.createItemHistory(this.itemService.transformToObject(this.buildItemHistory("quantity")), this.data.item.id);
            if(duplicateItem !== undefined) {
              this.firestoreService.updateItemQuantity(duplicateItemId, duplicateItem.quantity! + this.quantity.value);
              this.firestoreService.createItemHistory(this.itemService.transformToObject(this.buildItemHistoryForExistingItem(duplicateItemId, duplicateItem)), duplicateItemId);
            } else {
              this.firestoreService.createItem(this.itemService.transformToObject(this.buildItem()), this.itemService.transformToObject(this.buildItemHistory("create")));
            }
          })
        }
      } else {
        console.log("???? FAIL I GUESS ???? FIX PLS")
      }
      this.closeModal();
    });
  }

  buildItem(): Item {
    return this.itemService.buildItem(
      this.data.item.name,
      this.data.item.rarity,
      this.data.item.type,
      this.data.item.cost,
      this.data.item.description,
      this.destination,
      this.quantity.value
    );
  }

  buildItemHistory(updateType: string): ItemHistory {
    return this.itemService.buildItemHistory(
      this.data.item.id,
      this.data.action === "move" ? ItemActions.MOVE : updateType === "create" ? ItemActions.CREATE: ItemActions.DELETE,
      this.data.user.character + " (" + this.data.user.player + ")",
      updateType === "owner" ? this.data.item.owner : undefined,
      updateType === "delete" ? "deleted" : updateType === "owner" || updateType === "create" ? this.destination : undefined,
      updateType === "quantity" || updateType === "delete" ? this.data.item.quantity : undefined,
      updateType === "quantity" || updateType === "delete" ? this.data.item.quantity - this.quantity.value : updateType === "create" ? this.quantity.value : undefined,
      updateType === "create" ? this.data.item.id : undefined
    )
  }

  buildItemHistoryForExistingItem(itemId: string, item: Item) {
    return this.itemService.buildItemHistory(
      itemId,
      ItemActions.MOVE,
      this.data.user.character,
      this.data.item.owner,
      item.owner,
      item.quantity,
      item.quantity + this.quantity.value,
      undefined
    );
  }

  closeModal(): void {
    this.dialog.closeAll();
  }
}
