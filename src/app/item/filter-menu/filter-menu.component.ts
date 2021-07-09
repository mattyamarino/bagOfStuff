import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrls: ['./filter-menu.component.css']
})
export class FilterMenuComponent implements OnInit {
  type?: string;
  name?: string;
  rarityArray = [
    {
      label:"common",
      selected:false,
    },
    {
      label:"uncommon",
      selected:false,
    },
    {
      label:"rare",
      selected:false,
    },
    {
      label:"very rare",
      selected:false,
    },
    {
      label:"legendary",
      selected:false,
    },
    {
      label:"artifact",
      selected:false,
    },
  ];

  types: string[] = [
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
    this.name = undefined;
    this.type = undefined;
    this.rarityArray.forEach(element => {
      element.selected = false;
    })
  }

  TEMP() {
    console.log("*******", this.rarityArray)
  }
}
