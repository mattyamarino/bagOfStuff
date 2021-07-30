import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrencyConstants } from 'src/app/config/CurrencyConstants';
import { User } from 'src/app/models/user';
import { CoinService } from 'src/app/services/coin/coin.service';
import { FirestoreService } from 'src/app/services/firestore/firestore.service';
import { MessageService } from 'src/app/services/message/message.service';
import { UserService } from 'src/app/services/user/user.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { SnackbarComponent } from 'src/app/shared/snackbar/snackbar.component';
import { MonetaryTransaction } from '../../models/MonetaryTransaction';

@Component({
  selector: 'app-transaction-modal',
  templateUrl: './transaction-modal.component.html',
  styleUrls: ['./transaction-modal.component.css']
})
export class TransactionModalComponent implements OnInit {
  latestTransaction!: MonetaryTransaction;
  displayedColumns: string[] = ['currency', 'transactionAmount', 'currentAmount', 'valueInSilver'];
  dataSource: any = [];
  transactionFormGroup!: FormGroup;
  selectedUser!: User;
  type!: string;
  processingTransaction: boolean = false;
  submitAttempted: boolean = false;
  isFieldsEmpty: boolean = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private firestoreService: FirestoreService, public dialog: MatDialog, public coinService: CoinService, 
  public userService: UserService,  private snackBar: MatSnackBar, private messageService: MessageService) {
    this.latestTransaction = data.latestTransaction;
    this.selectedUser = data.selectedUser;
    this.type = data.type;
  }

  ngOnInit(): void {
    this.populateColumns();
    this.generateFormGroup();
  }

  populateColumns(): void {
    this.dataSource.push({
      currency: 'Platinum', transactionAmount: 0, valueInSilver: '100sp', currentAmount: this.latestTransaction.platinumTotal
    });
    this.dataSource.push({
      currency: 'Electrum', transactionAmount: 0, valueInSilver: '50sp', currentAmount: this.latestTransaction.electrumTotal
    });
    this.dataSource.push({
      currency: 'Silver', transactionAmount: 0, valueInSilver: '1sp', currentAmount: this.latestTransaction.silverTotal
    });
    this.dataSource.push({
      currency: 'Copper', transactionAmount: 0, valueInSilver: '0.1sp', currentAmount: this.latestTransaction.copperTotal
    });
    this.dataSource.push({
      currency: 'Gold', transactionAmount: 0, valueInSilver: '0.1sp', currentAmount: this.latestTransaction.goldTotal
    });
  }

  generateFormGroup() {
    const group: any = {};
    group["description"] = new FormControl('', Validators.required);
    this.dataSource.forEach((element: { currency: string; }) => {
      group[element.currency] = new FormControl(0, Validators.required);
    });
    this.transactionFormGroup = new FormGroup(group);
    this.transactionFormGroup.updateValueAndValidity()
  }

  isInvalidAmount(currency: string): boolean {
    let amount: number = this.transactionFormGroup.get(currency)!.value;
    let currentTotal: number = this.getTotalForCurrencyType(currency);
    let result: boolean = false;
    if (this.type === "Withdraw") {
      result = (currentTotal - amount) < 0;
    } else {
      result = amount < 0;
    }

    if (result) {
      this.transactionFormGroup.get(currency)!.setErrors({ 'incorrect': true });
    } else {
      this.transactionFormGroup.get(currency)!.setErrors(null);
    }
    if (amount > CurrencyConstants.maxAmount) {
      this.transactionFormGroup.get(currency)?.setErrors({max: {max: CurrencyConstants.maxAmount, actual: amount}})
    }
    return result;
  }

  getTotalForCurrencyType(currency: string): number {
    switch (currency) {
      case "Platinum":
        return this.latestTransaction.platinumTotal;
      case "Electrum":
        return this.latestTransaction.electrumTotal;
      case "Silver":
        return this.latestTransaction.silverTotal;
      case "Copper":
        return this.latestTransaction.copperTotal;
      case "Gold":
        return this.latestTransaction.goldTotal;
      default:
        return 0;
    }
  }

  getTransactionTotalForCurrencyType(currency: string, transaction: MonetaryTransaction): void {
    const adjustmentAmount: number = this.transactionFormGroup.get(currency)!.value;

    if (currency === "Platinum") {
      transaction.platinumDeposited = adjustmentAmount;
      if (this.type === "Withdraw") {
        transaction.platinumTotal = this.latestTransaction.platinumTotal - adjustmentAmount;
      } else {
        transaction.platinumTotal = this.latestTransaction.platinumTotal + adjustmentAmount;
      }
    }
    if (currency === "Electrum") {
      transaction.electrumDeposited = adjustmentAmount;
      if (this.type === "Withdraw") {
        transaction.electrumTotal = this.latestTransaction.electrumTotal - adjustmentAmount;
      } else {
        transaction.electrumTotal = this.latestTransaction.electrumTotal + adjustmentAmount;
      }
    }
    if (currency === "Silver") {
      transaction.silverDeposited = adjustmentAmount;
      if (this.type === "Withdraw") {
        transaction.silverTotal = this.latestTransaction.silverTotal - adjustmentAmount;
      } else {
        transaction.silverTotal = this.latestTransaction.silverTotal + adjustmentAmount;
      }
    }
    if (currency === "Copper") {
      transaction.copperDeposited = adjustmentAmount;
      if (this.type === "Withdraw") {
        transaction.copperTotal = this.latestTransaction.copperTotal - adjustmentAmount;
      } else {
        transaction.copperTotal = this.latestTransaction.copperTotal + adjustmentAmount;
      }
    }
    if (currency === "Gold") {
      transaction.goldDeposited = adjustmentAmount;
      if (this.type === "Withdraw") {
        transaction.goldTotal = this.latestTransaction.goldTotal - adjustmentAmount;
      } else {
        transaction.goldTotal = this.latestTransaction.goldTotal + adjustmentAmount;
      }
    }
  }

  async completeTransaction() {
    let newTransaction: MonetaryTransaction = new MonetaryTransaction;

    this.firestoreService.getLatestTransactionOnce().subscribe(res => {
      const response = <MonetaryTransaction[]>res.docs.map(doc => doc.data());;
      this.latestTransaction = response[0];
      if (!this.processingTransaction && this.validateTransaction(newTransaction)) {
        this.processingTransaction = true;

        newTransaction.description = this.transactionFormGroup.get('description')!.value;
        newTransaction.type = this.type;
        newTransaction.createdOn = Date.now();
        newTransaction.createdBy = this.userService.getUserLabel(this.selectedUser);

        this.firestoreService.createCurrencyTransaction(this.coinService.transformToObject(newTransaction)).then(res => {
          this.openSnackbar(this.messageService.monetaryTransactionMessage(newTransaction, this.getTransactionValueInSilver()), false)
        });

        this.closeDialog();
      } else {
        this.openSnackbar(this.messageService.overdraftFundsMessage(), true)
      }
    });
  }

  validateTransaction(transaction: MonetaryTransaction): boolean {
    this.transactionFormGroup.markAllAsTouched();
    this.submitAttempted = true;
    this.updateAvailableAmounts();
    this.dataSource.forEach((element: { currency: string; transactionAmount: number; }) => {
      this.getTransactionTotalForCurrencyType(element.currency, transaction);
    });
    return (!this.isEmptyTransaction(transaction) && this.transactionFormGroup.valid && this.isTransactionAmountsValid());
  }

  updateAvailableAmounts(): void {
    this.dataSource[0].currentAmount = this.latestTransaction.platinumTotal;
    this.dataSource[1].currentAmount = this.latestTransaction.electrumTotal;
    this.dataSource[2].currentAmount = this.latestTransaction.silverTotal;
    this.dataSource[3].currentAmount = this.latestTransaction.copperTotal;
    this.dataSource[4].currentAmount = this.latestTransaction.goldTotal;
  }

  isEmptyTransaction(transaction: MonetaryTransaction): boolean {
    if (transaction.platinumDeposited == 0 &&
      transaction.electrumDeposited == 0 &&
      transaction.silverDeposited == 0 &&
      transaction.copperDeposited == 0 &&
      transaction.goldDeposited == 0) {
      this.isFieldsEmpty = true;
      return true;
    }
    return false
  }

  isTransactionAmountsValid(): boolean {
    let isValid: boolean = true;

    this.dataSource.forEach((element: any) => {
      if (this.isInvalidAmount(element.currency)) {
        isValid = false;
      };
    });

    return isValid;
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }


  onFocusOutEvent(event: any): void {
    if (event.target.value == '') {
      event.target.value = 0;
    }
  }

  clearZeroAmount(event: any): void {
    if (event.target.value == 0) {
      event.target.value = undefined;
    }
  }

  getTransactionValueInSilver(): number {
    let amount = 0;
    this.dataSource.forEach((element: { currency: any; transactionAmount: any; }) => {
      amount += this.getCurrentAmountValueInSilver(element.currency, this.transactionFormGroup.get(element.currency)?.value);
    });
    return amount;
  }

  getCurrentAmountValueInSilver(currency: string, amount: number): number {
    switch (currency) {
      case "Platinum":
        return amount * 100;
      case "Electrum":
        return amount * 50;
      case "Silver":
        return amount;
      case "Copper":
        return amount * 0.1;
      case "Gold":
        return amount * 0.1;
      default:
        return 0;
    }
  }

  getTransactionSymbol(): string {
    return this.type === "Withdraw" ? "-" : "+";
  }

  getTransactionSummaryForCurrency(currency: string): string {
    return this.transactionFormGroup.get(currency)?.value > 0 ? this.getTransactionSymbol() + this.transactionFormGroup.get(currency)!.value.toString() + " " + currency + "\n" : "";
  }

  confirmAction(): void {
    if (this.validateTransaction(new MonetaryTransaction)) {

      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        maxWidth: "400px",
        data: {
          confirm: "confirm " + this.type,
          cancel: "go back",
          title: "complete " + this.type + "?",
          message: this.getTransactionSummaryForCurrency("Platinum") +
          this.getTransactionSummaryForCurrency("Electrum") +
          this.getTransactionSummaryForCurrency("Silver") +
          this.getTransactionSummaryForCurrency("Copper") +
          this.getTransactionSummaryForCurrency("Gold")
        }
      });

      dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult) {
          this.completeTransaction();
        }
      });
    }
  }

  openSnackbar(message: string, isError: boolean): void {
    this.snackBar.openFromComponent(SnackbarComponent, {
      duration: 5000,
      horizontalPosition: "center",
      verticalPosition: "top",
      data: {
        message: message,
        isError: isError
      }
    });
  }

  getLabelForAmountField(): string {
    return "Amount To " + this.type;
  }
}