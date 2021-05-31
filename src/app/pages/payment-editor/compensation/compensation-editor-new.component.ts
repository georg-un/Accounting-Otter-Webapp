import { Component, OnInit } from '@angular/core';
import { AbstractPaymentEditor } from '../abstract-payment-editor';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/states/app.state';
import { PaymentEditorService } from '../payment-editor.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FullscreenDialogService } from '../../../shared/fullscreen-dialog/fullscreen-dialog.service';
import { IdGeneratorService } from '../../../core/id-generator.service';
import { filter, map, take, takeUntil, tap } from 'rxjs/operators';
import { Debit } from '../../../core/entity/debit';
import { PurchaseActions } from '../../../store/actions/purchase.actions';
import { Purchase } from '../../../core/entity/purchase';
import { UserSelectors } from '../../../store/selectors/user.selectors';
import { User } from '../../../core/entity/user';
import { combineLatest, Observable } from 'rxjs';

@Component({
  selector: 'app-compensation-editor-new',
  templateUrl: './compensation-editor.component.html',
  styleUrls: [
    '../payment-editor.component.scss',
    './compensation-editor.component.scss'
  ]
})
export class CompensationEditorNewComponent extends AbstractPaymentEditor implements OnInit {

  public receivers$: Observable<User[]>;
  public receiverId: string;
  private currentUser$: Observable<User>;

  constructor(protected store: Store<AppState>,
              protected editorService: PaymentEditorService,
              protected snackBar: MatSnackBar,
              protected dialog: MatDialog,
              protected fullscreenDialog: FullscreenDialogService,
              protected idGeneratorService: IdGeneratorService
  ) {
    super(store, editorService, fullscreenDialog, snackBar, dialog);
  }

  ngOnInit() {
    super.ngOnInit();
    this.purchase = new Purchase();

    this.currentUser$ = this.store.select(UserSelectors.selectCurrentUser);
    this.currentUser$.pipe(
      filter(Boolean),
      takeUntil(this.onDestroy$)
    ).subscribe((currentUser: User) => {
      this.purchase.buyerId = currentUser.userId;
    });
    this.receivers$ = combineLatest([this.users$, this.currentUser$]).pipe(
      map(([users, currentUser]) => users.filter(u => u.userId !== currentUser.userId))
    );
  }

  onViewReceiptClick(): void {}

  submitPurchase(): void {
    if (!this.isPurchaseValid(false)) {
      return;
    }
    this.idGeneratorService.generatePurchaseId()
      .pipe(take(1))
      .subscribe((purchaseId: string) => {
        if (purchaseId) {
          this.purchase.purchaseId = purchaseId;
          this.purchase.isCompensation = true
          this.purchase.debits = [
            new Debit({
              debitId: this.idGeneratorService.generateDebitId(purchaseId, 0),
              debtorId: this.receiverId,
              amount: this.sumAmount
            })
          ];
          this.store.dispatch(
            PurchaseActions.addNewPurchase({
              purchase: this.purchase,
              receipt: null
            })
          );
        } else {
          this.snackBar.open('Ooops, something went wrong.');
        }
      });
  }
}
