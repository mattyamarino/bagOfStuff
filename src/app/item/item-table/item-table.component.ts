import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Item } from 'src/app/models/Item';
import { FirestoreService } from 'src/app/services/firestore/firestore.service';

@Component({
  selector: 'app-item-table',
  templateUrl: './item-table.component.html',
  styleUrls: ['./item-table.component.css']
})
export class ItemTableComponent implements OnInit {
  @Input() user!: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<Item>([]);
  displayedColumns: string[] = [
    'icon',
    'name',
    'type',
    'rarity',
    'cost',
    'withdraw',
    'delete',
  ];
  filteredValues = {
    type: '', rarity: ''
  };
  
  constructor(private firestoreService: FirestoreService) { }
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.getItems();
  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = this.customFilterPredicate();
  }

  getItems(): void {
    this.firestoreService.getItems(this.user).subscribe(res => {
      this.firestoreService.sortItemsDescendingByLastUpdatedOn(<Item[]><unknown>res);
      this.dataSource.data = <Item[]><unknown>res;
    });
  }


  // **************BEGIN FILTER METHODS**************
  customFilterPredicate() {
    const myFilterPredicate = (data: Item, filter: string): boolean => {
      let searchString = JSON.parse(filter);
      return data.type.toString().trim().indexOf(searchString.type) !== -1 &&
        this.applyRarityPredicate(data, searchString);
    }
    return myFilterPredicate;
  }

  updateTypeFilter(event: string): void {
    if(event == null) {
      event = "";
    }
    this.filteredValues['type'] = event;
    this.dataSource.filter = JSON.stringify(this.filteredValues);
  }

  updateRarityFilter(event: string): void {
    if(event == null) {
      event = "";
    } 
    this.filteredValues['rarity'] = event;
    this.dataSource.filter = JSON.stringify(this.filteredValues);
  }

  applyRarityPredicate(data: Item, searchString: any): boolean {
    if(searchString.rarity == "") {
      return true;
    }
    return data.rarity.toString().trim().toLowerCase() == searchString.rarity.toLowerCase();
  }
  // **************END FILTER METHODS**************

  moveItem(): void {

  }

  deleteItem(): void {

  }

  getRarity(rarity: string): string {
    switch (rarity) {
      case "very rare":
        return 'very-rare';
      default:
        return rarity;
    }
  }

  getItemIcon(type: string): string {
    return type.split(" ")[0].toLowerCase();
  }
}
