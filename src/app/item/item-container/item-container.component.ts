import { Input } from '@angular/core';
import { Component, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'src/app/models/user';
import { ItemTransactionModalComponent } from '../item-transaction-modal/item-transaction-modal.component';

@Component({
  selector: 'app-item-container',
  templateUrl: './item-container.component.html',
  styleUrls: ['./item-container.component.css']
})
export class ItemContainerComponent implements OnInit {
  @Input() user!: User;
  players: User[] = [];

  constructor(public dialog: MatDialog) { }

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
    return user.role === "dm" ? "DM's Stash" : user.character.split(" ")[0] + "'s Items";
  }

  openDepositDialog(): void {
    this.dialog.open(ItemTransactionModalComponent, {
      data: {
        user: this.user,
        createdFor: "bank"
      }
    });
  }
  
  openHistoryDialog(): void {

  }
}
