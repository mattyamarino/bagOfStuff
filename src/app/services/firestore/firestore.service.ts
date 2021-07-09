import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreConstants } from 'src/app/config/FirestoreConstants';
import { MonetaryTransaction } from 'src/app/models/MonetaryTransaction';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: AngularFirestore) { }

  getUsers() {
    return this.firestore.collection(FirestoreConstants.users).valueChanges();
  }

  getCurrencyTransactions(queryDate: number) {
    return this.firestore.collection(FirestoreConstants.currencyTransactions,
      ref => ref.where("createdOn", ">", queryDate)).get();
  }

  getLatestTransaction() {
    return this.firestore.collection(FirestoreConstants.currencyTransactions,
      ref => ref.orderBy("createdOn", "desc").limit(1)).valueChanges();
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
}
