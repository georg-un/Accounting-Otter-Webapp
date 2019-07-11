import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TransactionCardComponent } from './transaction-card/transaction-card.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatListModule,
  MatSidenavModule,
  MatToolbarModule
} from '@angular/material';
import { SidenavComponent } from './sidenav/sidenav.component';
import { HeaderComponent } from './header/header.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { UserCardComponent } from './user-card/user-card.component';
import { OverviewComponent } from './overview/overview.component';
import { PaymentViewComponent } from './payment-view/payment-view.component';
import { DebitCardComponent } from './debit-card/debit-card.component';
import { PaymentEditorComponent } from './payment-editor/payment-editor.component';

@NgModule({
  declarations: [
    AppComponent,
    TransactionCardComponent,
    SidenavComponent,
    HeaderComponent,
    TransactionsComponent,
    UserCardComponent,
    OverviewComponent,
    PaymentViewComponent,
    DebitCardComponent,
    PaymentEditorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
