import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Item } from 'src/app/models/Item';

@Component({
  selector: 'app-item-table',
  templateUrl: './item-table.component.html',
  styleUrls: ['./item-table.component.css']
})
export class ItemTableComponent implements OnInit {
  @Input() items!: Item[];
  dataSource = new MatTableDataSource<Item>([]);
  displayedColumns: string[] = [
    'icon',
    'name',
    'type',
    'rarity',
    'cost',
    'withdraw',

  ];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor() { }
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.data = this.items;
  }

  ngOnInit(): void {
  }

  moveItem(): void {

  }

  getRarity(rarity: string) {
    switch (rarity) {
      case "very rare":
        return 'very-rare';
      default:
        return rarity;
    }
  }

  getItemIcon(type: string) {
    return type.split(" ")[0].toLowerCase();
  }
}
