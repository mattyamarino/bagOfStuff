import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreConstants } from 'src/app/config/FirestoreConstants';
import { ExternalItem } from 'src/app/models/ExternalItem';
import { Item } from 'src/app/models/Item';
import { MonetaryTransaction } from 'src/app/models/MonetaryTransaction';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: AngularFirestore) { }

  getUsers() {
    return this.firestore.collection(FirestoreConstants.users).valueChanges({ idField: 'id' });
  }

  // CURRENCY FUNCTIONS
  getCurrencyTransactions(queryDate: number) {
    return this.firestore.collection(FirestoreConstants.currencyTransactions,
      ref => ref.where("createdOn", ">=", queryDate)).get();
  }

  getLatestTransaction() {
    return this.firestore.collection(FirestoreConstants.currencyTransactions,
      ref => ref.orderBy("createdOn", "desc").limit(1)).valueChanges({ idField: 'id' });
  }

  createCurrencyTransaction(data: any) {
    return new Promise<any>((resolve, reject) => {
      this.firestore
        .collection(FirestoreConstants.currencyTransactions)
        .add(data)
        .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    });
  }

  getLatestTransactionFromList(currencyTransactions: MonetaryTransaction[]): MonetaryTransaction {
    if (currencyTransactions.length === 0) {
      let transaction: MonetaryTransaction = new MonetaryTransaction;
      transaction.platinumTotal = 0;
      transaction.electrumTotal = 0;
      transaction.silverTotal = 0;
      transaction.copperTotal = 0;
      transaction.goldTotal = 0;
      return transaction;
    } else {
      this.sortTransactionsDescendingByDate(currencyTransactions);
      return currencyTransactions[0];
    }
  }

  sortTransactionsDescendingByDate(currencyTransactions: MonetaryTransaction[]): void {
    currencyTransactions.sort(function (x, y) {
      return y.createdOn - x.createdOn;
    });
  }

  calculateTotalValueInSilver(transaction: MonetaryTransaction): void {
    transaction.totalValueInSilver = (transaction.platinumTotal * 100);
    transaction.totalValueInSilver += (transaction.electrumTotal * 50);
    transaction.totalValueInSilver += transaction.silverTotal;
    transaction.totalValueInSilver += (transaction.copperTotal / 10);
    transaction.totalValueInSilver += (transaction.goldTotal / 10);
  }

  calculateTransactionValueInSilver(transaction: MonetaryTransaction): void {
    transaction.totalValueInSilver = (transaction.platinumDeposited * 100);
    transaction.totalValueInSilver += (transaction.electrumDeposited * 50);
    transaction.totalValueInSilver += transaction.silverDeposited;
    transaction.totalValueInSilver += (transaction.copperDeposited / 10);
    transaction.totalValueInSilver += (transaction.goldDeposited / 10);
  }

  // ITEM FUNCTIONS
  createItem(itemData: any, itemHistory: any) {
    return new Promise<any>((resolve, reject) => {
      this.firestore
        .collection(FirestoreConstants.items)
        .add(itemData)
        .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
          this.createItemHistory(itemHistory, docRef.id);
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    });
  }

  private createItemHistory(itemHistory: any, itemId: string) {
    itemHistory.itemId = itemId;
    return new Promise<any>((resolve, reject) => {
      this.firestore
        .collection(FirestoreConstants.itemHistory)
        .add(itemHistory)
        .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    });
  }

  getItems(owner: string) {
    console.log(owner)
    return this.firestore.collection(FirestoreConstants.items,
      ref => ref.where("owner", "==", owner)).valueChanges({ idField: 'id' });
  }

  sortItemsDescendingByLastUpdatedOn(items: Item[]): void {
    items.sort(function (x, y) {
      return y.lastUpdatedOn - x.lastUpdatedOn;
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
