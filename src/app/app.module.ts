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
    ConfirmationDialogComponent
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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
