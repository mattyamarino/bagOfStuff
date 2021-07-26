import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Item } from 'src/app/models/Item';
import { User } from 'src/app/models/user';
import { FirestoreService } from 'src/app/services/firestore/firestore.service';
import { ItemService } from 'src/app/services/item/item.service';
import { ItemActionComponent } from '../item-action/item-action.component';
import { ItemDescriptionComponent } from '../item-description/item-description.component';

@Component({
  selector: 'app-item-table',
  templateUrl: './item-table.component.html',
  styleUrls: ['./item-table.component.css']
})
export class ItemTableComponent implements OnInit {
  @Input() user?: User;
  @Input() vault?: User;
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
    'sell',
    'delete',
  ];
  filteredValues = {
    type: '', rarity: ''
  };
  
  constructor(private firestoreService: FirestoreService, public itemService: ItemService,  private dialog: MatDialog) { }
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.getItems();
  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = this.customFilterPredicate();
  }

  getItems(): void {
    const query =  this.isForBank ? "bank" : this.vault!.short
    this.firestoreService.getItems(query).subscribe(res => {
      this.itemService.sortItemsDescendingByLastUpdatedOn(<Item[]><unknown>res);
      this.dataSource.data = <Item[]><unknown>res
    });
  }

  getTooltipLabel(): string {
    const destination = this.isForBank ? "Personal Vault" : "Party Item Vault"
    return "Move Item(s) To " + destination
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
    this.dialog.open(ItemDescriptionComponent, {
      data: {
        item: item,
        showQuantity: true
      }
    });
  }

  sellItem(item: Item): void {
    this.dialog.open(ItemActionComponent, {
      width: "385px",
      data: {
       item: item,
       user: this.user,
       action: "sell",
       vault: this.vault
      }
    });
  }

  moveItem(item: Item): void {
    this.dialog.open(ItemActionComponent, {
      width: "385px",
      data: {
       item: item,
       user: this.user,
       action: "move",
       vault: this.vault
      }
    });
  }

  deleteItem(item: Item): void {
    this.dialog.open(ItemActionComponent, {
      width: "385px",
      data: {
       item: item,
       user: this.user,
       action: "delete",
       vault: this.vault
      }
    });
  }

  getItemIcon(type: string): string {
    return type.split(" ")[0].toLowerCase();
  }

  isNewItem(lastUpdatedOn: number): boolean {
    return lastUpdatedOn > this.user?.lastLogin!
  }
}
