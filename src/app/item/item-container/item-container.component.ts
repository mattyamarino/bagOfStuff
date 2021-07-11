import { Input } from '@angular/core';
import { Component, OnInit, Output } from '@angular/core';
import { Item } from 'src/app/models/Item';

@Component({
  selector: 'app-item-container',
  templateUrl: './item-container.component.html',
  styleUrls: ['./item-container.component.css']
})
export class ItemContainerComponent implements OnInit {
  TEMPITEM: Item = {
    id: "aaljvlkasdf",
    name: "Sword Of Stuff",
    type: "weapon (sword)",
    rarity: "very rare",
    cost: 10000,
    owner: 'bank'
  }

  TEMPITEM2: Item = {
    id: "aaljvlkasdf",
    name: "Staff Of Twos",
    type: "staff",
    rarity: "legendary",
    cost: 50000,
    owner: 'bank'
  }

  TEMPITEM3: Item = {
    id: "aaljvlkasdf",
    name: "Rod Of Three",
    type: "rod",
    rarity: "artifact",
    cost: 100000,
    owner: 'bank'
  }

  TEMPITEM4: Item = {
    id: "aaljvlkasdf",
    name: "Scroll Of Four Bites",
    type: "scroll",
    rarity: "rare",
    cost: 1000,
    owner: 'bank'
  }

  TEMPITEM5: Item = {
    id: "aaljvlkasdf",
    name: "Potion Of Commoness",
    type: "potion",
    rarity: "common",
    cost: 100,
    owner: 'bank'
  }
  
  TEMPITEM6: Item = {
    id: "aaljvlkasdf",
    name: "Ring Of Sixes",
    type: "ring",
    rarity: "uncommon",
    cost: 150,
    owner: 'bank'
  }
  
  TEMPITEM7: Item = {
    id: "aaljvlkasdf",
    name: "Figure Of Rorix The Sky God",
    type: "Wondrous item",
    rarity: "very rare",
    cost: 29000,
    owner: 'bank'
  }

  TEMPITEMS = [this.TEMPITEM, this.TEMPITEM2, this.TEMPITEM3, this.TEMPITEM4, this.TEMPITEM5, this.TEMPITEM6, this.TEMPITEM7];

  @Output() bankItems: Item[] = this.TEMPITEMS;
  @Output() userItems: Item[] = [];
  @Input() user!: string;

  constructor() { }

  ngOnInit(): void {
  }

  openDepositDialog(): void {

  }
  
  openHistoryDialog(): void {

  }
}
