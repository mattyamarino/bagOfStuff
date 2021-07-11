import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrls: ['./filter-menu.component.css']
})
export class FilterMenuComponent implements OnInit {
  @Output() typeEvent = new EventEmitter<string>();
  @Output() rarityEvent = new EventEmitter<string>();
  type = new FormControl;
  rarity = new FormControl;

  types: string[] = [
    "adventuring gear",
    "armor",
    "potion",
    "ring",
    "rod",
    "scroll",
    "staff",
    "wand",
    "weapon"
  ];


  constructor() { }

  ngOnInit(): void {
    this.type.valueChanges.subscribe((typeValue) => {
    this.typeEvent.emit(this.type.value);
    });
    this.rarity.valueChanges.subscribe((rarityValue) => {
    this.rarityEvent.emit(this.rarity.value);
    });
  }

  clearFilters(): void {
    this.type.reset();
    this.rarity.reset();
  }
}
