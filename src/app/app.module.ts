import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AppComponent } from './app.component';
import { environment } from "src/environments/environment";
import { MoneyComponent } from './coin/money/money.component';
import { UserComponent } from './user/user.component';
import { BagParentComponent } from './bag-parent/bag-parent.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSelectModule} from '@angular/material/select';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { TransactionModalComponent } from './coin/transaction-modal/transaction-modal.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import { MonetaryHistoryComponent } from './coin/monetary-history/monetary-history.component';
import {MatPaginatorModule} from '@angular/material/paginator';
import { NumericDirective } from './config/numeric.directive';
import {MatSortModule} from '@angular/material/sort';
import { ItemContainerComponent } from './item/item-container/item-container.component';
import { ItemTableComponent } from './item/item-table/item-table.component';
import { HttpClientModule } from '@angular/common/http';
import {MatTabsModule} from '@angular/material/tabs';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import { FilterMenuComponent } from './item/filter-menu/filter-menu.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { ItemTransactionModalComponent } from './item/item-transaction-modal/item-transaction-modal.component';
import {MatStepperModule} from '@angular/material/stepper';
import {MatRadioModule} from '@angular/material/radio';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { ItemDescriptionComponent } from './item/item-description/item-description.component';
import {MatDividerModule} from '@angular/material/divider';
import {MatTooltipModule} from '@angular/material/tooltip';
import { ItemActionComponent } from './item/item-action/item-action.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { ItemHistoryComponent } from './item/item-history/item-history.component';
import {MatBadgeModule} from '@angular/material/badge';
import { SnackbarComponent } from './shared/snackbar/snackbar.component';
import { AppRoutingModule } from './app-routing.module';
import { SignInComponent } from './sign-in/sign-in/sign-in.component';
import { ForgotPasswordComponent } from './sign-in/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './sign-in/verify-email/verify-email.component';
import { SignUpComponent } from './sign-in/sign-up/sign-up.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';


@NgModule({
  declarations: [
    AppComponent,
    MoneyComponent,
    UserComponent,
    BagParentComponent,
    TransactionModalComponent,
    MonetaryHistoryComponent,
    NumericDirective,
    ItemContainerComponent,
    ItemTableComponent,
    ConfirmationDialogComponent,
    FilterMenuComponent,
    ItemTransactionModalComponent,
    ItemDescriptionComponent,
    ItemActionComponent,
    ItemHistoryComponent,
    SnackbarComponent,
    SignInComponent,
    ForgotPasswordComponent,
    VerifyEmailComponent,
    SignUpComponent,
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    BrowserAnimationsModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTableModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    HttpClientModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonToggleModule,
    MatStepperModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatBadgeModule,
    AppRoutingModule,
    MatSlideToggleModule,
  ],
  providers: [
    MatDatepickerModule, 
    TitleCasePipe, 
    DecimalPipe, 
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
