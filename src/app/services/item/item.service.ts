import { Injectable } from '@angular/core';
import { ExternalItem } from 'src/app/models/ExternalItem';
import { Item } from 'src/app/models/Item';
import { ItemHistory } from 'src/app/models/ItemHistory';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor() { }

  transformToObject(item: any) {
    return Object.assign({}, item);
  }

  buildItem(name: string, rarity: string, type: string, cost: number, description: string, owner: string, quantity: number): Item {
    let newItem: Item = new Item;
    newItem.name = name;
    newItem.rarity = rarity;
    newItem.type = type;
    newItem.cost = cost;
    newItem.description = description;
    newItem.owner = owner;
    newItem.lastUpdatedOn = Date.now();
    newItem.quantity = quantity;

    return newItem;
  }

  buildItemHistory(id: any, action: string, createdBy: string, previousOwner: any, currentOwner: any,
    previousQuantity: any, currentQuantity: any, origin: any): ItemHistory {
    let newItemHistory: ItemHistory = new ItemHistory;
    if (id !== undefined) { newItemHistory.itemId = id; }
    newItemHistory.action = action
    newItemHistory.createdBy = createdBy
    newItemHistory.createdOn = Date.now();
    if (previousOwner !== undefined) { newItemHistory.previousOwner = previousOwner; }
    if (currentOwner !== undefined) { newItemHistory.currentOwner = currentOwner; }
    if (previousQuantity !== undefined) { newItemHistory.previousQuantity = previousQuantity; }
    if (currentQuantity !== undefined) { newItemHistory.currentQuantity = currentQuantity; }
    if (origin !== undefined) { newItemHistory.origin = origin; }
    return newItemHistory;
  }

  sortItemsDescendingByLastUpdatedOn(items: Item[]): void {
    items.sort(function (x, y) {
      return y.lastUpdatedOn - x.lastUpdatedOn;
    });
  }

  sortItemsHistoryDescendingByLastUpdatedOn(histories: ItemHistory[]): void {
    histories.sort(function (x, y) {
      return y.createdOn - x.createdOn;
    });
  }

  sortItemsAsscendingByName(items: ExternalItem[]): void {
    items.sort(function (y, x) {
      return y.name.toLowerCase().localeCompare(x.name.toLowerCase());
    });
  }

  getRarity(rarity: string): string {
    switch (rarity) {
      case "very rare":
        return 'very-rare';
      default:
        return rarity;
    }
  }
}
