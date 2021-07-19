import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItemActions } from 'src/app/config/ItemConstants';
import { Item } from 'src/app/models/Item';
import { ItemHistory } from 'src/app/models/ItemHistory';
import { FirestoreService } from 'src/app/services/firestore/firestore.service';
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

  constructor(public dialog: MatDialog, public dialogRef: MatDialogRef<ItemActionComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private firestoreService: FirestoreService) { }

  ngOnInit(): void {
    this.setDestination();
    this.setQuantity();
  }

  setDestination(): void {
    this.destination = this.data.item.owner === "bank" ? this.data.user.character : "bank"
    this.destinationLabel = this.data.item.owner === "bank" ? this.data.user.short + "'s Item Vault" : "Party Item Vault";
  }

  setQuantity(): void {
    this.quantity.setValidators([Validators.required, Validators.min(1), Validators.max(this.data.item.quantity), Validators.pattern('^(0|[1-9][0-9]*)$')]);
    if(this.data.item.quantity === 1) {
      this.quantity.setValue(1);
    }
  }

  getTitle(): string {
    return this.data.action === "move" ? "Move Item(s) to \n\n" + this.destinationLabel : "Discard Item(s)"  
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
        if(existingItem.quantity === this.quantity.value) {
          this.firestoreService.updateItemOwner(this.data.item.id, this.destination);
          this.firestoreService.createItemHistory(this.buildItemHistory(), this.data.item.id);
        } else {
          this.firestoreService.updateItemQuantity(this.data.item.id, this.data.item.quantity - this.quantity.value)
          // this.firestoreService.createItemHistory(this.build)
        }
      } else {
        console.log("???? FAIL I GUESS ???? FIX PLS")
      }
      this.closeModal();
    });
  }

  buildItemHistory(): ItemHistory {
    return new ItemHistory;
  }

  closeModal(): void {
    this.dialog.closeAll();
  }
}
