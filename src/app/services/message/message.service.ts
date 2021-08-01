import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { ItemActions } from 'src/app/config/ItemConstants';
import { MonetaryTransaction } from 'src/app/models/MonetaryTransaction';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(public titleCasePipe: TitleCasePipe, public numberPipe: DecimalPipe) { }

  itemActionMessage(itemName: string, quantity: number, action: string, valueInSilver?: number) {
    let message = "Succesfully " + this.titleCasePipe.transform(action) + " " + quantity + " " + this.titleCasePipe.transform(itemName);
    if (action === ItemActions.SELL) {
      message += " for " + valueInSilver + "sp"
    }
    return message
  }
  
  monetaryTransactionMessage(transaction: MonetaryTransaction, valueInSilver: number): string {
    if(transaction.type === "Withdraw") {
      return "Successfully Withdrew Coin With A Value Of " + this.numberPipe.transform(valueInSilver, '2.2-2') + "sp"
    } else {
      return "Successfully Deposited Coin With A Value Of " + this.numberPipe.transform(valueInSilver, '2.2-2') + "sp"
    }
  }

  overdraftFundsMessage(): string {
    return "Another User Has Withdrawn Funds.  Insufficient Amount Available";
  }

  overdraftItemQuantityMessage(): string {
    return "Another User Has Updated Item, That Quantity Is No Longer Available"
  }

}
