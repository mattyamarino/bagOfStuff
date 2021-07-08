import { Component, OnInit, ViewChild } from '@angular/core';
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
  dataSource = new MatTableDataSource<Item>([]);
  displayedColumns: string[] = [
    'name',
    'type',
    'rarity',
    'cost',
    'quantity' 
  ];

  TEMPITEM: Item = {
    id: "aaljvlkasdf",
    name: "Sword Of Stuff",
    type: "weapon",
    rarity: "very rare",
    cost: 10000,
    quantity: 1
  }

  TEMPITEMS = [this.TEMPITEM];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor() { }
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.data = this.TEMPITEMS;
  }

  ngOnInit(): void {
  }


  getIconType(): string {
    return 'weapon';
  }
}
