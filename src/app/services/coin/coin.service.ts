import { Injectable } from '@angular/core';
import { MonetaryTransaction } from 'src/app/models/MonetaryTransaction';

@Injectable({
  providedIn: 'root'
})
export class CoinService {

  constructor() { }

  transformToObject(transaction: MonetaryTransaction): Object {
    return Object.assign({}, transaction);
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
