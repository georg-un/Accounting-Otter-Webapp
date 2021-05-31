import { Component, OnInit } from '@angular/core';
import { User } from '../../../core/entity/user';
import { AppState } from '../../../store/states/app.state';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, filter, take, takeUntil } from 'rxjs/operators';
import { Purchase } from '../../../core/entity/purchase';
import { IdGeneratorService } from '../../../core/id-generator.service';
import { Debit } from '../../../core/entity/debit';
import { PaymentEditorService } from '../payment-editor.service';
import { PurchaseActions } from '../../../store/actions/purchase.actions';
import { UserSelectors } from '../../../store/selectors/user.selectors';
import { AbstractPaymentEditor } from '../abstract-payment-editor';
import { DistributionFragment } from '../distribution-fragment';
import { ReceiptScannerService } from '../../receipt-scanner/receipt-scanner.service';
import { FullscreenDialogService } from '../../../shared/fullscreen-dialog/fullscreen-dialog.service';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-editor-new',
  templateUrl: './purchase-editor.component.html',
  styleUrls: [
    '../payment-editor.component.scss',
    './purchase-editor.component.scss'
  ]
})
export class PurchaseEditorNewComponent extends AbstractPaymentEditor implements OnInit {

  // TODO: Add animation to slide custom debit fields in and out
  // TODO: Add validation before upload
  // FIXME: If this page is opened as first page, the user data is not yet loaded and an error is thrown
  customDistribution = false;

  constructor(protected store: Store<AppState>,
              protected editorService: PaymentEditorService,
              protected snackBar: MatSnackBar,
              protected dialog: MatDialog,
              protected fullscreenDialog: FullscreenDialogService,
              protected idGeneratorService: IdGeneratorService,
              private receiptScannerService: ReceiptScannerService
  ) {
    super(store, editorService, fullscreenDialog, snackBar, dialog);
  }

  ngOnInit() {
    super.ngOnInit();
    this.purchase = new Purchase();

    this.store.select(UserSelectors.selectCurrentUser)
      .pipe(
        filter(Boolean),
        takeUntil(this.onDestroy$)
      )
      .subscribe((currentUser: User) => {
        this.purchase.buyerId = currentUser.userId;
      });

    this.users$
      .pipe(
        filter(Boolean),
        distinctUntilChanged(),
        takeUntil(this.onDestroy$)
      )
      .subscribe((users: User[]) => {
        users.forEach((user: User) => {
          this.distributionFragments.push(
            DistributionFragment.fromUser(user)
          );
        });
      });

    this.receipt$ = of(this.receiptScannerService.receipt);
  }

  onViewReceiptClick(): void {
    if (this.receiptScannerService.receipt) {
      this.fullscreenDialog.openReceiptViewDialog(this.receipt$, false);
    }
  }

  submitPurchase(): void {
    if (!this.customDistribution) {
      this.distributeToAllFields();
    }
    if (!this.isPurchaseValid()) {
      return;
    }
    this.idGeneratorService.generatePurchaseId()
      .pipe(take(1))
      .subscribe((purchaseId: string) => {
        if (purchaseId) {
          this.purchase.purchaseId = purchaseId;
          this.purchase.debits = [];
          this.distributionFragments.forEach((distributionFragment, index) => {
            if (distributionFragment.amount) {
              this.purchase.debits.push(
                new Debit({
                  debitId: this.idGeneratorService.generateDebitId(purchaseId, index),  // TODO: Check if debitId is truthy
                  debtorId: distributionFragment.user.userId,
                  amount: distributionFragment.amount
                })
              );
            }
          });
          this.store.dispatch(
            PurchaseActions.addNewPurchase({
              purchase: this.purchase,
              receipt: this.receiptScannerService.receipt
            })
          );
        } else {
          this.snackBar.open('Ooops, something went wrong.');
        }
      });
  }

  onDistributionToggleChange(change: MatSlideToggleChange): void {
    this.customDistribution = change.checked;
  }

}
