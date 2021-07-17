import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Item } from 'src/app/models/Item';
import { User } from 'src/app/models/user';
import { FirestoreService } from 'src/app/services/firestore/firestore.service';
import { ItemDescriptionComponent } from '../item-description/item-description.component';

@Component({
  selector: 'app-item-table',
  templateUrl: './item-table.component.html',
  styleUrls: ['./item-table.component.css']
})
export class ItemTableComponent implements OnInit {
  @Input() user?: User;
  @Input() isForBank!: boolean;
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
  
  constructor(private firestoreService: FirestoreService, private dialog: MatDialog) { }
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.getItems();
  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = this.customFilterPredicate();
  }

  getItems(): void {
    const query =  this.isForBank ? "bank" : this.user!.character!

    this.firestoreService.getItems(query).subscribe(res => {
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

  openItemDescription(item: Item): void {
    console.log(item)
    this.dialog.open(ItemDescriptionComponent, {
      data: {
        item: item
      }
    });
  }

  moveItem(): void {

  }

  deleteItem(): void {

  }

  getItemIcon(type: string): string {
    return type.split(" ")[0].toLowerCase();
  }
}
