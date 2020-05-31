import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Purchase, SyncStatusEnum } from '../core/entity/purchase';
import { Store } from '@ngrx/store';
import { AppState } from '../store/states/app.state';
import { Observable, Subject } from 'rxjs';
import { User } from '../core/entity/user';
import { UserSelectors } from '../store/selectors/user.selectors';
import { PurchaseSelectors } from '../store/selectors/purchase.selectors';
import { takeUntil } from 'rxjs/operators';
import { PurchaseActions } from '../store/actions/purchase.actions';
import { Debit } from '../core/entity/debit';
import { Router } from '@angular/router';
import { Category } from '../core/entity/category';
import { CategorySelectors } from '../store/selectors/category.selectors';
import { MatDialog, MatTooltip } from '@angular/material';


@Component({
  selector: 'app-purchase-view',
  templateUrl: './purchase-view.component.html',
  styleUrls: ['./purchase-view.component.scss']
})
export class PurchaseViewComponent implements OnInit, OnDestroy {

  // FIXME: Load entity data if not present.
  purchase: Purchase;
  user$: Observable<User>;
  category$: Observable<Category>;
  debitSum: number;
  private onDestroy$: Subject<boolean> = new Subject();

  @ViewChild('tooltip', {static: false}) tooltip: MatTooltip;

  private readonly syncIndicatorTooltipContent = {
    syncIndicatorRemote: 'Transaction is synced.',
    syncIndicatorSyncing: 'Syncing transaction...',
    syncIndicatorError: 'Synchronization error!'
  };

  constructor(
    private store: Store<AppState>,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.store.select(PurchaseSelectors.selectCurrentPurchase)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((purchase) => {
        if (purchase) {
          this.purchase = purchase;
          this.user$ = this.selectUserById(purchase.buyerId);
          this.category$ = this.store.select(CategorySelectors.selectCategoryById(purchase.categoryId));
          this.debitSum = purchase.debits
            .map((debit: Debit) => debit.amount)
            .reduce((sum, current) => sum + current);
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  selectUserById(id: string): Observable<User> {
    return this.store.select(UserSelectors.selectUserById(), {id: id});
  }

  onImageButtonClick(): void {
    this.router.navigate(['receipt', this.purchase.purchaseId]);
  }

  onDeleteButtonClick(): void {
    this.store.dispatch(PurchaseActions.deletePurchase({purchase: this.purchase}));
  }

  onSyncIndicatorClick(): void {
    this.tooltip.show();
    setTimeout(() => {
      this.tooltip.hide(2500);
    }, 0);
  }

  getSyncIndicatorTooltipMessage(): string {
    if (this.purchase) {
      switch (this.purchase.syncStatus) {
        case SyncStatusEnum.Remote:
          return this.syncIndicatorTooltipContent.syncIndicatorRemote;
        case SyncStatusEnum.Syncing:
          return this.syncIndicatorTooltipContent.syncIndicatorSyncing;
        case SyncStatusEnum.Local:
        case SyncStatusEnum.LocalDelete:
        case SyncStatusEnum.LocalUpdate:
          return this.syncIndicatorTooltipContent.syncIndicatorError;
        default:
          return null;
      }
    }
  }

}
