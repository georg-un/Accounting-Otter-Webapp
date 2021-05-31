import { OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Purchase } from '../../core/entity/purchase';
import { UserSelectors } from '../../store/selectors/user.selectors';
import { takeUntil } from 'rxjs/operators';
import { User } from '../../core/entity/user';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/states/app.state';
import { PaymentEditorService } from './payment-editor.service';
import { DistributionFragment } from './distribution-fragment';
import { MultilineSnackbarComponent } from '../../shared/multiline-snackbar/multiline-snackbar.component';
import { BigNumber } from 'bignumber.js';
import { Category } from '../../core/entity/category';
import { CategorySelectors } from '../../store/selectors/category.selectors';
import { FullscreenDialogService } from '../../shared/fullscreen-dialog/fullscreen-dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

export abstract class AbstractPaymentEditor implements OnInit, OnDestroy {

  purchase: Purchase;
  receipt$: Observable<Blob>;
  sumAmount: number;
  users$: Observable<User[]>;
  categories$: Observable<Category[]>;
  date: Date;
  distributionFragments: DistributionFragment[] = [];
  protected onDestroy$: Subject<boolean> = new Subject();

  readonly autofilledState = {
    amount: false,
    date: false
  };

  protected constructor(protected store: Store<AppState>,
                        protected editorService: PaymentEditorService,
                        protected fullscreenDialog: FullscreenDialogService,
                        protected snackBar: MatSnackBar,
                        protected dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.users$ = this.store.select(UserSelectors.selectAllUsers);
    this.categories$ = this.store.select(CategorySelectors.selectAllCategories);

    this.editorService.addPurchaseTrigger
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(() => {
        this.submitPurchase();
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  abstract submitPurchase(): void;

  abstract onViewReceiptClick(): void;

  onSetDateNowClick(): void {
    const date = new Date();
    this.date = date;
    this.purchase.date = date.getTime();
  }

  onScanQrCodeClick(): void {
    this.fullscreenDialog.openQrScannerDialog()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((result: { date: Date, amount: BigNumber }) => {
        if (result) {
          setTimeout(() => {
            this.sumAmount = result.amount.toNumber();
            this.date = result.date;
            this.purchase.date = result.date.getTime();
            this.autofilledState.amount = true;
            this.autofilledState.date = true;
          }, 200);
        }
      });
  }

  isPurchaseValid(): boolean {
    if (!this.purchase.buyerId) {
      this.snackBar.openFromComponent(MultilineSnackbarComponent, {data: 'User ID is missing.'});
      return false;
    } else if (!this.purchase.date) {
      this.snackBar.open('Please enter a date.');
      return false;
    } else if (!this.sumAmount) {
      this.snackBar.open('Please enter the amount.');
      return false;
    } else if (!new BigNumber(this.sumAmount).isEqualTo(
      this.distributionFragments
        .filter(fragment => fragment.checked)
        .map(fragment => new BigNumber(fragment.amount))
        .reduce((sum, curr) => sum.plus(curr), new BigNumber(0)))
    ) {
      this.snackBar.open('Total amount and debits don\'t match.');
      return false;
    } else {
      return true;
    }
  }

  resetDistributionFragments(): void {
    this.distributionFragments.forEach(fragment => {
      fragment.amount = null;
    });
  }

  distributeToAllFields(): void {
    this.distributeToFields(
      this.distributionFragments.filter(fragment => fragment.checked)
    );
  }

  distributeToEmptyFields(): void {
    this.distributeToFields(
      this.distributionFragments.filter(fragment => fragment.checked && !fragment.amount)
    );
  }

  private distributeToFields(relevantFields: DistributionFragment[]): void {
    const sum = new BigNumber(this.sumAmount);
    // Get the remaining value
    const rest = this.getRest(
      sum,
      this.distributionFragments
        .filter(fragment => fragment.checked)
        .map(fragment => new BigNumber(fragment.amount || 0))
    );
    if ((sum.isPositive() && rest.isLessThan(0)) || (sum.isNegative() && rest.isGreaterThan(0))) {
      console.error(`A remainder (${rest.toNumber()}) was left over on when distributing the total amount (${this.sumAmount}).`);
      this.snackBar.open('Could not distribute the amount.');
      return;
    }
    // Distribute the rest by the Bresenham Algorithm
    const assignedValues: BigNumber[] = this.distributeByBresenham(
      rest,
      new BigNumber(relevantFields.length)
    );
    // Assign the calculated values to the distribution-fragments
    relevantFields.forEach(field => {
      field.amount = assignedValues.pop().plus(field.amount || 0).toNumber();
    });
  }

  private getRest(totalAmount: BigNumber, amounts: BigNumber[]): BigNumber {
    return totalAmount.minus(
      amounts.reduce((a, b) => a.plus(b), new BigNumber(0))
    );
  }

  private distributeByBresenham(rest: BigNumber, nFields: BigNumber): BigNumber[] {
    const result: BigNumber[] = [];
    // Distribute the rest evenly
    const assignedValue = rest.dividedBy(nFields).decimalPlaces(2, BigNumber.ROUND_DOWN);
    for (let i = 0; i < nFields.toNumber(); i++) {
      result.push(assignedValue);
    }
    // Calculate the remained that could not be evenly distributed
    let remainder = rest.minus(assignedValue.times(nFields.toNumber()));
    // Distribute the rest to all fields cent by cent
    let resultIdx = Math.floor(Math.random() * result.length);  // randomly pick a starting position
    while (remainder.isGreaterThan(0)) {
      if (resultIdx >= result.length) {
        resultIdx = 0;  // reset index
      }
      result[resultIdx] = result[resultIdx].plus(0.01);
      remainder = remainder.minus(0.01);
      resultIdx += 1;
    }
    return result;
  }

}
