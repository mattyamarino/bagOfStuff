import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrls: ['./filter-menu.component.css']
})
export class FilterMenuComponent implements OnInit {
  type?: string;
  name?: string;
  rarityArray = [];

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
  }

  clearFilters(): void {
    console.log("*******", this.rarityArray)
    this.name = undefined;
    this.type = undefined;
    this.rarityArray = [];
    console.log("***after****", this.rarityArray)
  }
}
