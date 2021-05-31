import { Component, OnInit } from '@angular/core';
import { AppState } from '../../../store/states/app.state';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { Purchase } from '../../../core/entity/purchase';
import { PaymentEditorService } from '../payment-editor.service';
import { PurchaseActions } from '../../../store/actions/purchase.actions';
import { AbstractPaymentEditor } from '../abstract-payment-editor';
import { PurchaseSelectors } from '../../../store/selectors/purchase.selectors';
import { UserSelectors } from '../../../store/selectors/user.selectors';
import { User } from '../../../core/entity/user';
import { combineLatest } from 'rxjs';
import { Debit } from '../../../core/entity/debit';
import { DistributionFragment } from '../distribution-fragment';
import { IdGeneratorService } from '../../../core/id-generator.service';
import { FinOBackendService } from '../../../core/fino-backend.service';
import { FullscreenDialogService } from '../../../shared/fullscreen-dialog/fullscreen-dialog.service';
import { BigNumber } from 'bignumber.js';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-purchase-editor-edit',
  templateUrl: './purchase-editor.component.html',
  styleUrls: [
    '../payment-editor.component.scss',
    './purchase-editor.component.scss'
  ]
})
export class PurchaseEditorEditComponent extends AbstractPaymentEditor implements OnInit {

  // TODO: Add animation to slide custom debit fields in and out
  // TODO: Add validation before upload
  // FIXME: If this page is opened as first page, the user data is not yet loaded and an error is thrown
  customDistribution = true;

  constructor(protected store: Store<AppState>,
              protected editorService: PaymentEditorService,
              protected snackBar: MatSnackBar,
              protected dialog: MatDialog,
              protected idGeneratorService: IdGeneratorService,
              protected fullscreenDialog: FullscreenDialogService,
              private restService: FinOBackendService,
  ) {
    super(store, editorService, fullscreenDialog, snackBar, dialog);
  }

  ngOnInit() {
    super.ngOnInit();

    const purchase$ = this.store.select(PurchaseSelectors.selectCurrentPurchase);
    const users$ = this.store.select(UserSelectors.selectAllUsers);

    combineLatest([purchase$, users$])
      .pipe(take(1))
      .subscribe(([purchase, users]: [Purchase, User[]]) => {
        // Set purchase from store
        this.purchase = Object.assign({}, purchase);
        this.date = new Date(this.purchase.date);
        // Set sumAmount from debits
        this.sumAmount = this.purchase.debits
          .map(debit => debit.amount)
          .map(amount => new BigNumber(amount))
          .reduce((sum: BigNumber, curr: BigNumber) => sum.plus(curr), new BigNumber(0))
          .toNumber();
        // Check if purchase contains debits from inexistent users
        const purchaseUserIds = this.purchase.debits.map(debit => debit.debtorId);
        const allUserIds = users.map(user => user.userId);
        if (purchaseUserIds.some(userId => !allUserIds.includes(userId))) {
          console.error('Purchase contains a userId that doesn\'t exist.');
          return;
        }
        // Generate distribution fragments by debit
        this.purchase.debits.forEach((debit: Debit) => {
          this.distributionFragments.push(
            DistributionFragment.fromDebit(
              debit,
              users.find(u => u.userId === debit.debtorId)
            )
          );
        });
        // Generate distribution fragments for all users without a debit
        allUserIds.filter(userId => !purchaseUserIds.includes(userId)).forEach(
          (userId) => {
            this.distributionFragments.push(
              DistributionFragment.fromUser(users.find(u => u.userId === userId))
            );
          }
        );
      });

    // Fetch receipt
    this.receipt$ = this.restService.fetchReceipt(this.purchase.purchaseId);
  }

  onViewReceiptClick(): void {
    this.fullscreenDialog.openReceiptViewDialog(this.receipt$, false);
  }

  submitPurchase(): void {
    if (!this.customDistribution) {
      this.distributeToAllFields();
    }
    if (!this.isPurchaseValid()) {
      return;
    }
    this.purchase.debits = [];
    this.distributionFragments.forEach((distributionFragment, index) => {
      if (distributionFragment.amount) {
        this.purchase.debits.push(
          new Debit({
            debitId: this.idGeneratorService.generateDebitId(this.purchase.purchaseId, index),
            debtorId: distributionFragment.user.userId,
            amount: distributionFragment.amount
          })
        );
      }
    });
    this.store.dispatch(
      PurchaseActions.updatePurchase({
        purchase: this.purchase
      })
    );
  }

  onDistributionToggleChange(change: MatSlideToggleChange): void {
    this.customDistribution = change.checked;
  }

}
