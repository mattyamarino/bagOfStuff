import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ItemActions } from 'src/app/config/ItemConstants';
import { Item } from 'src/app/models/Item';
import { ItemHistory } from 'src/app/models/ItemHistory';
import { User } from 'src/app/models/user';
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
  actionFormGroup!: FormGroup;
  players: User[] = [];

  constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<ItemActionComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    private firestoreService: FirestoreService, public itemService: ItemService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.setDestination();
    this.setFormGroup();
    this.setPlayers();
  }

  setDestination(): void {
    this.destinationLabel = this.data.item.owner === "bank" ? this.data.user.short + "'s Item Vault" : "Party Item Vault";
  }

  setFormGroup(): void {
    this.actionFormGroup = new FormGroup({
      quantity: new FormControl('', [Validators.required, Validators.min(1), Validators.max(this.data.item.quantity), Validators.pattern('^(0|[1-9][0-9]*)$')]),
      destination: new FormControl(this.data.user.character, Validators.required)
    });
    if (this.data.item.quantity === 1) {
      this.actionFormGroup.get("quantity")!.setValue(1);
    }
  }

  setPlayers(): void {
    if (this.data.user.role === "dm") {
      let bank = new User;
      bank.character = "bank";
      bank.player = "";
      this.players.push(bank);
      this.data.user.associatedPlayerCharacters.map((val: any) => this.players.push(Object.assign({}, val)));
      const idx = this.players.indexOf(this.data.vault);
      this.players.splice(idx, 1);
    }
  }

  getTitle(): string {
    return this.data.action === "move" ? "Move Item(s)" : "Discard Item(s)";
  }

  getMessage(): string {
    return this.data.action === "move" ? "Send to " + this.destinationLabel : "Remove due to being sold, consumed, stolen, etc..";
  }

  moveDeleteItem(): void {
    if (this.actionFormGroup.valid) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          confirm: "confirm",
          cancel: "go back",
          title: this.data.action + " " + this.actionFormGroup.get("quantity")!.value + " Item(s)?",
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
      if (existingItem.owner === this.data.item.owner && existingItem.quantity! >= this.data.item.quantity - this.actionFormGroup.get("quantity")!.value) {
        this.firestoreService.getItemsByNameTypeAndOwner(this.data.item.name, this.data.item.type, this.actionFormGroup.get("destination")?.value).subscribe(res => {
          const duplicateItem: Item = <Item>res.docs[0]?.data();
          const duplicateItemId = res.docs[0]?.id
          // DELETE FULL STACK
          if (this.data.action === "delete" && existingItem.quantity === this.actionFormGroup.get("quantity")!.value) {
            this.deleteItemAndSetQuantityToZero()
          } else if (this.data.action === "delete") {
            // DELETE PARTIAL STACK
            this.firestoreService.updateItemQuantity(this.data.item.id, this.data.item.quantity - this.actionFormGroup.get("quantity")!.value);
            this.firestoreService.createItemHistory(this.itemService.transformToObject(this.buildItemHistory("delete")), this.data.item.id);
          } else if (existingItem.quantity === this.actionFormGroup.get("quantity")!.value) {
            // MOVE FULL STACK TO DUPLICATE ITEM AT DESTINATION
            if (duplicateItem !== undefined && this.data.item.name.charAt(this.data.item.name.length - 1) !== '*') {
              this.deleteItemAndSetQuantityToZero()
              this.updateQuantityOnDuplicateItemAtDestination(duplicateItemId, duplicateItem);
              // MOVE FULL STACK
            } else {
              this.firestoreService.updateItemOwner(this.data.item.id, this.actionFormGroup.get("destination")?.value);
              this.firestoreService.createItemHistory(this.itemService.transformToObject(this.buildItemHistory("owner")), this.data.item.id);
            }
            // MOVE PARTIAL STACK
          } else {
            this.firestoreService.updateItemQuantity(this.data.item.id, this.data.item.quantity - this.actionFormGroup.get("quantity")!.value);
            this.firestoreService.createItemHistory(this.itemService.transformToObject(this.buildItemHistory("quantity")), this.data.item.id);
            // MOVE PARTIAL STACK TO DUPLICATE ITEM AT DESTINATION 
            if (duplicateItem !== undefined && this.data.item.name.charAt(this.data.item.name.length - 1) !== '*') {
              this.updateQuantityOnDuplicateItemAtDestination(duplicateItemId, duplicateItem);
            } else {
              this.firestoreService.createItem(this.itemService.transformToObject(this.buildItem()), this.itemService.transformToObject(this.buildItemHistory("create")));
            }
          }
        });
      } else {
        this.openSnackbar();
      }
      this.closeModal();
    });
  }

  deleteItemAndSetQuantityToZero() {
    this.firestoreService.updateItemOwnerAndQuantity(this.data.item.id, "deleted", this.data.item.quantity - this.actionFormGroup.get("quantity")!.value);
    this.firestoreService.createItemHistory(this.itemService.transformToObject(this.buildItemHistory("delete")), this.data.item.id);
  }

  updateQuantityOnDuplicateItemAtDestination(duplicateItemId: string, duplicateItem: Item) {
    this.firestoreService.updateItemQuantity(duplicateItemId, duplicateItem.quantity! + this.actionFormGroup.get("quantity")!.value);
    this.firestoreService.createItemHistory(this.itemService.transformToObject(this.buildItemHistoryForExistingItem(duplicateItemId, duplicateItem)), duplicateItemId);
  }

  buildItem(): Item {
    return this.itemService.buildItem(
      this.data.item.name,
      this.data.item.rarity,
      this.data.item.type,
      this.data.item.cost,
      this.data.item.description,
      this.actionFormGroup.get("destination")!.value,
      this.actionFormGroup.get("quantity")!.value
    );
  }

  buildItemHistory(updateType: string): ItemHistory {
    return this.itemService.buildItemHistory(
      this.data.item.id,
      this.data.action === "move" ? ItemActions.MOVE : updateType === "create" ? ItemActions.CREATE : ItemActions.DELETE,
      this.data.user.character + " (" + this.data.user.player + ")",
      updateType === "owner" ? this.data.item.owner : undefined,
      updateType === "delete" ? "deleted" : updateType === "owner" || updateType === "create" ? this.actionFormGroup.get("destination")?.value : undefined,
      updateType === "quantity" || updateType === "delete" ? this.data.item.quantity : undefined,
      updateType === "quantity" || updateType === "delete" ? this.data.item.quantity - this.actionFormGroup.get("quantity")!.value : updateType === "create" ? this.actionFormGroup.get("quantity")!.value : undefined,
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
      item.quantity + this.actionFormGroup.get("quantity")!.value,
      undefined
    );
  }

  openSnackbar(): void {
    this.snackBar.open("", "Another User Has Already Moved That Item", {
      duration: 4000,
      horizontalPosition: "center",
      verticalPosition: "top"
    });
  }

  closeModal(): void {
    this.dialog.closeAll();
  }
}
