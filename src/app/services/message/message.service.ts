import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { ItemActions } from 'src/app/config/ItemConstants';
import { MonetaryTransaction } from 'src/app/models/MonetaryTransaction';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(public titleCasePipe: TitleCasePipe, public numberPipe: DecimalPipe) { }

  itemActionMessage(itemName: string, quantity: number, action: string, valueInStandard?: number) {
    let message = "Succesfully " + this.titleCasePipe.transform(action) + " " + quantity + " " + this.titleCasePipe.transform(itemName);
    if (action === ItemActions.SELL) {
      message += " for " + valueInStandard + "gp"
    }
    return message
  }
  
  monetaryTransactionMessage(transaction: MonetaryTransaction, valueInStandard: number): string {
    if(transaction.type === "Withdraw") {
      return "Successfully Withdrew Coin With A Value Of " + this.numberPipe.transform(valueInStandard, '2.2-2') + "gp"
    } else {
      return "Successfully Deposited Coin With A Value Of " + this.numberPipe.transform(valueInStandard, '2.2-2') + "gp"
    }
  }

  overdraftFundsMessage(): string {
    return "Another User Has Withdrawn Funds.  Insufficient Amount Available";
  }

  overdraftItemQuantityMessage(): string {
    return "Another User Has Updated Item, That Quantity Is No Longer Available"
  }

}
