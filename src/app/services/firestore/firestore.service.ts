import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreConstants } from 'src/app/config/FirestoreConstants';
import { User } from 'src/app/models/user';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: AngularFirestore, public userService: UserService) { }

  // USER FUNCTIONS
  getUsers() {
    return this.firestore.collection(FirestoreConstants.users).valueChanges({ idField: 'id' });
  }

  updateUserLastLogin(id: string) {
    return this.firestore.collection(FirestoreConstants.users).doc(id).update({
      lastLogin: Date.now() + 2000
    })
      .then(() => { 
        console.log("Document " + id + " successfully updated!");
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  }

  // CURRENCY FUNCTIONS
  getCurrencyTransactions(queryDate?: number) {
    queryDate = this.setQueryDate(queryDate!);
    return this.firestore.collection(FirestoreConstants.currencyTransactions,
      ref => ref.where("createdOn", ">=", queryDate)).get();
  }

  getLatestTransaction() {
    return this.firestore.collection(FirestoreConstants.currencyTransactions,
      ref => ref.orderBy("createdOn", "desc").limit(1)).valueChanges({ idField: 'id' });
  }

  getLatestTransactionOnce() {
    return this.firestore.collection(FirestoreConstants.currencyTransactions,
      ref => ref.orderBy("createdOn", "desc").limit(1)).get();
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
  createItem(itemData: any, itemHistory: any, userId: string) {
    this.updateUserLastLogin(userId);
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

  getItems(owner: string) {
    return this.firestore.collection(FirestoreConstants.items,
      ref => ref.where("owner", "==", owner)).valueChanges({ idField: 'id' });
  }

  getItemsByNameTypeAndOwner(name: string, type: string, owner: string) {
    return this.firestore.collection(FirestoreConstants.items,
      ref => ref.where("name", "==", name)
        .where("type", "==", type)
        .where("owner", "==", owner)
    ).get();
  }

  getItem(id: string) {
    return this.firestore.collection(FirestoreConstants.items).doc(id).get();
  }

  updateItemQuantity(id: string, quantity: number, userId: string) {
    this.updateUserLastLogin(userId);
    return this.firestore.collection(FirestoreConstants.items).doc(id).update({
      quantity: quantity,
      lastUpdatedOn: Date.now()
    })
      .then(() => {
        console.log("Document " + id + " successfully updated!");
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  }

  updateItemQuantityAndCost(id: string, quantity: number, cost: number, userId: string) {
    this.updateUserLastLogin(userId);
    return this.firestore.collection(FirestoreConstants.items).doc(id).update({
      quantity: quantity,
      cost: cost,
      lastUpdatedOn: Date.now()
    })
      .then(() => {
        console.log("Document " + id + " successfully updated!");
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  }

  updateItemOwner(id: string, owner: string, userId: string) {
    this.updateUserLastLogin(userId);
    return this.firestore.collection(FirestoreConstants.items).doc(id).update({
      owner: owner,
      lastUpdatedOn: Date.now()
    })
      .then(() => {
        console.log("Document " + id + " successfully updated!");
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  }

  updateItemOwnerAndQuantity(id: string, owner: string, quantity: number, userId: string) {
    this.updateUserLastLogin(userId);
    return this.firestore.collection(FirestoreConstants.items).doc(id).update({
      owner: owner,
      quantity: quantity,
      lastUpdatedOn: Date.now()
    })
      .then(() => {
        console.log("Document " + id + " successfully updated!");
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  }

  // ITEM HISTORY FUNCTIONS
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

  getItemHistories(queryDate?: number) {
    queryDate = this.setQueryDate(queryDate!);
    return this.firestore.collection(FirestoreConstants.itemHistory,
      ref => ref.where("createdOn", ">=", queryDate)).get();
  }
  
  getItemHistoriesForItem(itemId: string, queryDate?: number) {
    queryDate = this.setQueryDate(queryDate!);
    return this.firestore.collection(FirestoreConstants.itemHistory,
      ref => ref.where("createdOn", ">=", queryDate)
      .where("itemId", "==", itemId)).get();
  }

  async getItemHistoriesForUser(user: User, queryDate?: number) {
    queryDate = this.setQueryDate(queryDate!);
    const historiesRef = this.firestore.collection(FirestoreConstants.itemHistory)

    const previousOwner = historiesRef.ref.where('previousOwner', '==', user.short).where("createdOn", ">=", queryDate).get();
    const currentOwner = historiesRef.ref.where('currentOwner', '==', user.short).where("createdOn", ">=", queryDate).get();
    const createdBy = historiesRef.ref.where('createdBy', '==', this.userService.getUserLabel(user)).where("createdOn", ">=", queryDate).get();

    const [previousQuerySnapshot, currentQuerySnapshot, createdQuerySnapshot] = await Promise.all([
      previousOwner,
      currentOwner,
      createdBy
    ]);

    const previousOwnerArray = previousQuerySnapshot.docs;
    const currentOwnerArray = currentQuerySnapshot.docs;
    const createdByArray = createdQuerySnapshot.docs;

    const historiesArray = previousOwnerArray.concat(currentOwnerArray.concat(createdByArray));

    return historiesArray;
  }
  
  // SET QUERYDATE
  setQueryDate(queryDate: number): number {
      return queryDate !== undefined ? queryDate : new Date(new Date().setDate(new Date().getDate() - 30)).getTime();
  }
}
