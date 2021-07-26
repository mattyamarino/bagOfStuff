import { TitleCasePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ItemActions } from 'src/app/config/ItemConstants';
import { Item } from 'src/app/models/Item';
import { ItemHistory } from 'src/app/models/ItemHistory';
import { MonetaryTransaction } from 'src/app/models/MonetaryTransaction';
import { User } from 'src/app/models/user';
import { CoinService } from 'src/app/services/coin/coin.service';
import { FirestoreService } from 'src/app/services/firestore/firestore.service';
import { ItemService } from 'src/app/services/item/item.service';
import { UserService } from 'src/app/services/user/user.service';
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
    private firestoreService: FirestoreService, public itemService: ItemService, public coinService: CoinService, public userService: UserService, 
    private snackBar: MatSnackBar,  public titleCasePipe: TitleCasePipe) { }

  ngOnInit(): void {
    this.setDestinationLabel();
    this.setFormGroup();
    this.setPlayers();
  }

  setDestinationLabel(): void {
    this.destinationLabel = this.data.item.owner === "bank" ? this.data.user.short + "'s Item Vault" : "Party Item Vault";
  }

  getDestination(): string {
    return this.data.item.owner === "bank" ? this.data.user.short : "bank"
  }

  setFormGroup(): void {
    this.actionFormGroup = new FormGroup({
      quantity: new FormControl('', [Validators.required, Validators.min(1), Validators.max(this.data.item.quantity), Validators.pattern('^(0|[1-9][0-9]*)$')]),
      destination: new FormControl(this.getDestination(), Validators.required)
    });
    if (this.data.item.quantity === 1) {
      this.actionFormGroup.get("quantity")!.setValue(1);
    }
  }

  setPlayers(): void {
    if (this.data.user.role === "dm") {
      if(this.data.vault !== undefined) {
        let bank = new User;
        bank.short = "bank";
        this.players.push(bank);
      }
      this.data.user.associatedPlayerCharacters.map((val: any) => this.players.push(Object.assign({}, val)));
      this.players.splice(this.players.findIndex(player => player.short === this.data.vault.short), 1);
    }
  }

  getTitle(): string {
    return this.data.action === "move" ? "Move Item(s)" : this.data.action === "delete" ? "Discard Item(s)" : this.data.action === "sell" ? "Sell Item(s)" : "";
  }

  getMessage(): string {
    return this.data.action === "move" && this.data.user.role !== "dm" ? "Send to " + this.destinationLabel : this.data.action === "delete" ? "Remove due to being bartered, consumed, stolen, etc.." : this.data.action === "sell" ? "Exchange item(s) for coin" : "";
  }

  getPlayerOptionLabel(user: User): string {
    return user.short === "bank" ? "Party Item Bank" : this.userService.getUserLabel(user);
  }

  moveDeleteItem(): void {
    if (this.actionFormGroup.valid) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          confirm: "confirm",
          cancel: "go back",
          title: this.data.action + " " + this.actionFormGroup.get("quantity")!.value + " Item(s)?",
          message: this.getConfirmationMessage(),
          centerMessage: true
        }
      });

      dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult) {
          this.completeAction();
        }
      });
    }
  }

  getConfirmationMessage(): string {
    let message = "";
    if(this.data.action === "sell") {
      message = "This will deposit " + this.data.item.cost * this.actionFormGroup.get("quantity")!.value + "sp into the Party Bank";
    }else if(this.data.action === "move") {
      message = "Send " + this.actionFormGroup.get("quantity")!.value + " Items to " + this.destinationLabel;
    }
    return message;
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
            // DELETE PARTIAL STACK
          } else if (this.data.action === "delete") {
            this.firestoreService.updateItemQuantity(this.data.item.id, this.data.item.quantity - this.actionFormGroup.get("quantity")!.value, this.data.user.id);
            this.firestoreService.createItemHistory(this.itemService.transformToObject(this.buildItemHistory("delete")), this.data.item.id);
            // SELL FULL STACK
          } else if (this.data.action === "sell" && existingItem.quantity === this.actionFormGroup.get("quantity")!.value) {
            this.firestoreService.updateItemOwnerAndQuantity(this.data.item.id, "sold", this.data.item.quantity - this.actionFormGroup.get("quantity")!.value, this.data.user.id);
            this.firestoreService.createItemHistory(this.itemService.transformToObject(this.buildItemHistory("sell")), this.data.item.id);
            this.sellItem();
            // SELL PARTIAL STACK
          } else if (this.data.action === "sell") {
            this.firestoreService.updateItemQuantity(this.data.item.id, this.data.item.quantity - this.actionFormGroup.get("quantity")!.value, this.data.user.id);
            this.firestoreService.createItemHistory(this.itemService.transformToObject(this.buildItemHistory("sell")), this.data.item.id);
            this.sellItem();
            // MOVE FULL STACK TO DUPLICATE ITEM AT DESTINATION
          } else if (existingItem.quantity === this.actionFormGroup.get("quantity")!.value) {
            if (duplicateItem !== undefined && this.data.item.name.charAt(this.data.item.name.length - 1) !== '*') {
              this.deleteItemAndSetQuantityToZero()
              this.updateQuantityOnDuplicateItemAtDestination(duplicateItemId, duplicateItem);
              // MOVE FULL STACK
            } else {
              this.firestoreService.updateItemOwner(this.data.item.id, this.actionFormGroup.get("destination")?.value, this.data.user.id);
              this.firestoreService.createItemHistory(this.itemService.transformToObject(this.buildItemHistory("owner")), this.data.item.id);
            }
            // MOVE PARTIAL STACK
          } else {
            this.firestoreService.updateItemQuantity(this.data.item.id, this.data.item.quantity - this.actionFormGroup.get("quantity")!.value, this.data.user.id);
            this.firestoreService.createItemHistory(this.itemService.transformToObject(this.buildItemHistory("quantity")), this.data.item.id);
            // MOVE PARTIAL STACK TO DUPLICATE ITEM AT DESTINATION 
            if (duplicateItem !== undefined && this.data.item.name.charAt(this.data.item.name.length - 1) !== '*') {
              this.updateQuantityOnDuplicateItemAtDestination(duplicateItemId, duplicateItem);
            } else {
              this.firestoreService.createItem(this.itemService.transformToObject(this.buildItem()), this.itemService.transformToObject(this.buildItemHistory("create")), this.data.user.id);
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
    this.firestoreService.updateItemOwnerAndQuantity(this.data.item.id, "deleted", this.data.item.quantity - this.actionFormGroup.get("quantity")!.value, this.data.user.id);
    this.firestoreService.createItemHistory(this.itemService.transformToObject(this.buildItemHistory("delete")), this.data.item.id);
  }

  updateQuantityOnDuplicateItemAtDestination(duplicateItemId: string, duplicateItem: Item) {
    this.firestoreService.updateItemQuantityAndCost(duplicateItemId, duplicateItem.quantity! + this.actionFormGroup.get("quantity")!.value, this.data.item.cost, this.data.user.id);
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
      this.data.item.name,
      this.data.item.rarity,
      this.data.action === "move" ? ItemActions.MOVE : updateType === "create" ? ItemActions.CREATE : updateType === "sell" ? ItemActions.SELL : ItemActions.DELETE,
      this.userService.getUserLabel(this.data.user),
      updateType === "owner" ? this.data.item.owner : undefined,
      updateType === "delete" ? "deleted" : updateType === "sell" ? "sold" : updateType === "owner" || updateType === "create" ? this.actionFormGroup.get("destination")?.value : undefined,
      updateType === "quantity" || updateType === "delete" || updateType === "sell" ? this.data.item.quantity : undefined,
      updateType === "quantity" || updateType === "delete" || updateType === "sell" ? this.data.item.quantity - this.actionFormGroup.get("quantity")!.value : updateType === "create" ? this.actionFormGroup.get("quantity")!.value : undefined,
      undefined,
      undefined,
      updateType === "create" ? this.data.item.id : undefined
    )
  }

  buildItemHistoryForExistingItem(itemId: string, item: Item) {
    return this.itemService.buildItemHistory(
      itemId,
      this.data.item.name,
      this.data.item.rarity,
      ItemActions.UPDATE,
      this.userService.getUserLabel(this.data.user),
      this.data.item.owner,
      item.owner,
      item.quantity,
      item.quantity + this.actionFormGroup.get("quantity")!.value,
      undefined,
      undefined,
      itemId
    );
  }

  sellItem(): void {
    this.firestoreService.getLatestTransactionOnce().subscribe(res => {
      const latestTransaction: MonetaryTransaction = res.docs.length !== 0 ? <MonetaryTransaction>res.docs[0]?.data() : this.coinService.buildEmptyMonertaryTransaction();
      this.firestoreService.createCurrencyTransaction(this.coinService.transformToObject(this.coinService.buildMonetaryTransaction(
        undefined,
        0,
        0,
        this.data.item.cost * this.actionFormGroup.get("quantity")!.value,
        0,
        0,
        latestTransaction.platinumTotal,
        latestTransaction.electrumTotal,
        latestTransaction.silverTotal + (this.data.item.cost * this.actionFormGroup.get("quantity")!.value),
        latestTransaction.copperTotal,
        latestTransaction.goldTotal,
        "Funds gained from selling: " + this.titleCasePipe.transform(this.data.item.name) + " (qty: " + this.actionFormGroup.get("quantity")!.value + ")",
        this.userService.getUserLabel(this.data.user),
        "Deposit",
        this.data.item.id
      )));
    });
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
