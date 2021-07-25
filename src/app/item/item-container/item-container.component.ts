import { Input } from '@angular/core';
import { Component, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ItemHistory } from 'src/app/models/ItemHistory';
import { User } from 'src/app/models/user';
import { FirestoreService } from 'src/app/services/firestore/firestore.service';
import { ItemService } from 'src/app/services/item/item.service';
import { ItemHistoryComponent } from '../item-history/item-history.component';
import { ItemTransactionModalComponent } from '../item-transaction-modal/item-transaction-modal.component';

@Component({
  selector: 'app-item-container',
  templateUrl: './item-container.component.html',
  styleUrls: ['./item-container.component.css']
})
export class ItemContainerComponent implements OnInit {
  @Input() user!: User;
  players: User[] = [];

  constructor(public dialog: MatDialog, public firestoreService: FirestoreService, public itemService: ItemService) { }

  ngOnInit(): void {
    this.populatePlayers()
  }
  
  populatePlayers(): void {
    if(this.user.role === "dm") {
      this.players = this.user.associatedPlayerCharacters!;
    } else {
      this.players.push(this.user)
    }
  }

  getPlayerBankLabel(user: User): string {
    return user.role === "dm" ? "DM's Stash" : user.short + "'s Items";
  }

  getVaultUser(playerCharacter: User): User {
    return this.user.role === "dm" ? this.user : playerCharacter;
  }

  openDepositDialog(user?: User): void {
    const createdFor = user !== undefined ? user.character : "bank";
    this.dialog.open(ItemTransactionModalComponent, {
      data: {
        user: this.user,
        createdFor: createdFor
      }
    });
  }
  
  openHistoryDialog(user?: User): void {
    if(user !== undefined) {
      this.getItemHistoriesForUser(user);
    } else {
      this.getAllItemHistories()
    }
  }


  getAllItemHistories(): void {
    this.firestoreService.getItemHistories().subscribe(res => {
      const histories = <ItemHistory[]>res.docs.map(doc => doc.data())
      this.itemService.sortItemsHistoryDescendingByLastUpdatedOn(histories)
      this.dialog.open(ItemHistoryComponent, {
        data: {
          target: "all",
          histories: histories
        }
      });
    });
  }

  getItemHistoriesForUser(user: User): void {
    this.firestoreService.getItemHistoriesForUser(user).then(res => {
      const histories = <ItemHistory[]>res.map(doc => doc.data())
      this.itemService.sortItemsHistoryDescendingByLastUpdatedOn(histories)
      this.dialog.open(ItemHistoryComponent, {
        data: {
          target: "player",
          histories: histories,
          user: user
        }
      });
    });
  } 
}
