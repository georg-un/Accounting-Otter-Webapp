import { Component, Input, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material';
import { AppState } from '../store/states/app.state';
import { Store } from '@ngrx/store';
import { take, takeUntil } from 'rxjs/operators';
import { Purchase } from '../core/entity/purchase';
import { PurchaseEditorService } from './purchase-editor.service';
import { PurchaseActions } from '../store/actions/purchase.actions';
import { AbstractEditor } from './abstract-purchase-editor';
import { PurchaseSelectors } from '../store/selectors/purchase.selectors';
import { UserSelectors } from '../store/selectors/user.selectors';
import { User } from '../core/entity/user';
import { combineLatest } from 'rxjs';
import { Debit } from '../core/entity/debit';
import { DistributionFragment } from './distribution-fragment';

@Component({
  selector: 'app-purchase-editor-edit',
  templateUrl: './purchase-editor.component.html',
  styleUrls: ['./purchase-editor.component.scss']
})
export class PurchaseEditorEditComponent extends AbstractEditor implements OnInit {

  // TODO: Add animation to slide custom debit fields in and out
  // TODO: Add validation before upload
  // FIXME: If this page is opened as first page, the user data is not yet loaded and an error is thrown
  customDistribution = true;

  constructor(protected store: Store<AppState>,
              protected editorService: PurchaseEditorService) {
    super(store, editorService);
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
          .reduce((sum, current) => sum + current);
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
      });
  }

  submitPurchase(): void {
    if (!this.isPurchaseValid()) {
      return;
    }
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