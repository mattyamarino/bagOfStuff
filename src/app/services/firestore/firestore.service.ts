import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreConstants } from 'src/app/config/FirestoreConstants';
import { ExternalItem } from 'src/app/models/ExternalItem';
import { Item } from 'src/app/models/Item';
import { MonetaryTransaction } from 'src/app/models/MonetaryTransaction';
import { User } from 'src/app/models/user';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: AngularFirestore) { }

  // USER FUNCTIONS
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

  createItemHistory(itemHistory: any, itemId: string) {
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
    return this.firestore.collection(FirestoreConstants.items,
      ref => ref.where("owner", "==", owner)).valueChanges({ idField: 'id' });
  }

  getItem(id: string) {
    return this.firestore.collection(FirestoreConstants.items).doc(id).get();
  }

  updateItemQuantity(id: string, quantity: number) {
    return this.firestore.collection(FirestoreConstants.items).doc(id).update({
      quantity: quantity,
      lastUpdatedOn: Date.now()
    })
      .then(() => {
        console.log("Document successfully updated!");
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  }

  updateItemOwner(id: string, owner: string) {
    return this.firestore.collection(FirestoreConstants.items).doc(id).update({
      owner: owner,
      lastUpdatedOn: Date.now()
    })
      .then(() => {
        console.log("Document successfully updated!");
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  }
}
