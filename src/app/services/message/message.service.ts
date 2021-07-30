import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { MonetaryTransaction } from 'src/app/models/MonetaryTransaction';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(public titleCasePipe: TitleCasePipe, public numberPipe: DecimalPipe) { }

  itemActionMessage(itemName: string, quantity: number, action: string) {
        return "Succesfully " + this.titleCasePipe.transform(action) + " " + quantity + " " + this.titleCasePipe.transform(itemName)
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
