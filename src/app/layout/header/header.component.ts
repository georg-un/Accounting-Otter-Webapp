import { Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/states/app.state';
import { Location } from '@angular/common';
import { PaymentEditorService } from '../../pages/payment-editor/payment-editor.service';
import { LayoutActions } from '../../store/actions/layout.actions';
import { LeftButtonIconEnum, RightButtonIconEnum } from './button-enums';
import { PurchaseActions } from '../../store/actions/purchase.actions';
import { UserActions } from '../../store/actions/user.actions';
import { LayoutSelectors } from '../../store/selectors/layout.selectors';
import { fadeOnChange, rotateOnChange } from '../layout.animations';
import { DynamicDialogButton, DynamicDialogData } from '../../shared/dynamic-dialog/dynamic-dialog-data.model';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogComponent } from '../../shared/dynamic-dialog/dynamic-dialog.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [rotateOnChange, fadeOnChange]
})
export class HeaderComponent implements OnInit, OnDestroy {

  showLogo$: Observable<boolean>;
  shouldSyncIconRotate$: Observable<boolean>;
  leftHeaderButton = 'menu';
  rightHeaderButton = 'sync';
  private onDestroy$: Subject<boolean> = new Subject();

  private readonly exitDialogData = <DynamicDialogData>{
    bodyHTML: `
    Are you sure you want to exit the editor?
    <br/><br/>
    All unsaved progress will be lost.
    <br/><br/>
    `,
    buttons: [
      <DynamicDialogButton>{
        index: 0,
        label: 'Cancel',
        result: false
      },
      <DynamicDialogButton>{
        index: 1,
        label: 'Leave',
        color: 'accent',
        result: true
      }
    ]
  };

  constructor(private editorService: PaymentEditorService,
              private store: Store<AppState>,
              private location: Location,
              private dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.showLogo$ = this.store.select(LayoutSelectors.showLogo);
    this.shouldSyncIconRotate$ = this.store.select(LayoutSelectors.shouldSyncIconRotate);

    this.store.select(LayoutSelectors.selectLeftHeaderButton)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((leftHeaderButton: string) => {
        this.leftHeaderButton = leftHeaderButton;
      });

    this.store.select(LayoutSelectors.selectRightHeaderButton)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((rightHeaderButton: string) => {
        this.rightHeaderButton = rightHeaderButton;
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  onLeftButtonClick(): void {
    if (this.leftHeaderButton === LeftButtonIconEnum.Menu) {
      this.store.dispatch(LayoutActions.toggleSidenav());
    } else if (this.leftHeaderButton === LeftButtonIconEnum.Back) {
      this.location.back();
    } else {
      const dialogref = this.dialog.open(DynamicDialogComponent, {
        data: this.exitDialogData
      });
      dialogref.afterClosed().subscribe((result: boolean) => {
        if (result === true) {
          this.location.back();
        }
      });
    }
  }

  onRightButtonClick(): void {
    if (this.rightHeaderButton === RightButtonIconEnum.Done) {
      this.editorService.emitAddPurchaseTrigger();
    } else {
      this.store.dispatch(UserActions.requestUsers());
      this.store.dispatch(PurchaseActions.syncPurchases());
    }
  }

}
