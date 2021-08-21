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

  buildMonetaryTransaction(id: any, platinumDeposited: number, electrumDeposited: number, silverDeposited: number, copperDeposited: number, goldDeposited: number,
    platinumTotal: number, electrumTotal: number, silverTotal: number, copperTotal: number, goldTotal: number,
    description: string, createdBy: string, type: string, soldItemId?: string): MonetaryTransaction {
    let transaction = new MonetaryTransaction;
    if(id !== undefined) {transaction.id === id};
    transaction.platinumDeposited = platinumDeposited;
    transaction.electrumDeposited = electrumDeposited;
    transaction.silverDeposited = silverDeposited;
    transaction.copperDeposited = copperDeposited;
    transaction.goldDeposited = goldDeposited;
    transaction.platinumTotal = platinumTotal;
    transaction.electrumTotal = electrumTotal;
    transaction.silverTotal = silverTotal;
    transaction.copperTotal = copperTotal;
    transaction.goldTotal = goldTotal;
    transaction.description = description;
    transaction.createdBy = createdBy;
    transaction.createdOn = Date.now();
    transaction.type = type;
    if(soldItemId !== undefined) {transaction.soldItemId = soldItemId};
    return transaction;
  }

  buildEmptyMonertaryTransaction(): MonetaryTransaction {
    return this.buildMonetaryTransaction(0,0,0,0,0,0,0,0,0,0,0,"","","");
  }

  sortTransactionsDescendingByDate(currencyTransactions: MonetaryTransaction[]): void {
    currencyTransactions.sort(function (x, y) {
      return y.createdOn - x.createdOn;
    });
  }

  calculateTotalValueInStandard(transaction: MonetaryTransaction): void {
    transaction.totalValueInStandard = (transaction.platinumTotal * 10);
    transaction.totalValueInStandard += (transaction.electrumTotal / 2);
    transaction.totalValueInStandard += transaction.silverTotal / 10;
    transaction.totalValueInStandard += (transaction.copperTotal / 100);
    transaction.totalValueInStandard += (transaction.goldTotal);
  }

  calculateTransactionValueInStandard(transaction: MonetaryTransaction): void {
    transaction.totalValueInStandard = (transaction.platinumDeposited * 10);
    transaction.totalValueInStandard += (transaction.electrumDeposited / 2);
    transaction.totalValueInStandard += transaction.silverDeposited / 10;
    transaction.totalValueInStandard += (transaction.copperDeposited / 100);
    transaction.totalValueInStandard += (transaction.goldDeposited);
  }
}
