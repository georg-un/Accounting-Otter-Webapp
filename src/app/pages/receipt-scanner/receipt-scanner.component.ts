import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { DocScannerConfig, NgxDocScannerComponent } from '@fino-ngx-doc-scanner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/states/app.state';
import { RouterSelectors } from '../../store/selectors/router.selectors';
import { take } from 'rxjs/operators';
import { ReceiptScannerService } from './receipt-scanner.service';
import { PurchaseActions } from '../../store/actions/purchase.actions';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-receipt-scanner',
  templateUrl: './receipt-scanner.component.html',
  styleUrls: ['./receipt-scanner.component.scss']
})
export class ReceiptScannerComponent implements OnInit, AfterViewInit {

  @ViewChild('fileInput', {static: false}) fileInput: ElementRef;
  @ViewChild('cameraInput', {static: false}) cameraInput: ElementRef;
  @ViewChild('docScanner', {static: false}) docScanner: NgxDocScannerComponent;

  rawImage;

  readonly config: DocScannerConfig = {
    editorBackgroundColor: '#e3f2fd',
    buttonThemeColor: 'primary',
    cropToolColor: '#f44336',
    cropToolShape: 'circle',
    exportImageIcon: 'done'
  };

  public docScannerReady: boolean = false;
  private purchaseId$: Observable<string>;

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private store: Store<AppState>,
    private snackBar: MatSnackBar,
    private receiptScannerService: ReceiptScannerService
  ) {
  }

  ngOnInit() {
    // Make sure all previously captured images are cleared from the service
    this.receiptScannerService.receipt = undefined;

    this.purchaseId$ = this.store.select(RouterSelectors.selectPurchaseId);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // Overwrite private ngx-doc-scanner properties
      this.docScanner['selectedFilter'] = 'original';  // set default image-filter
      this.docScanner['editorButtons'].find(button => button.name === 'exit').icon = 'clear';  // set exit icon
    }, 0);

    // Prompt user for receipt image (disabled for now)
    // this.promptImageCapture();
  }

  onDocScannerReady($event: boolean) {
    this.docScannerReady = $event;
  }

  onImageCapture($event) {
    if ($event && $event.target && $event.target.files) {
      if ($event.target.files.length > 1) {
        this.snackBar.open('Multiple files selected. Only the first one will be used.');
      }
      this.rawImage = $event.target.files[0];
    }
  }

  onEditResult($event) {
    this.receiptScannerService.receipt = $event;
    this.dispatchAndLeave();
  }

  onExitEditor($event) {
    this.rawImage = null;
  }

  promptImageCapture(): void {
    this.cameraInput.nativeElement.click();
  }

  promptStorageSelection(): void {
    this.fileInput.nativeElement.click();
  }

  isProcessing(): boolean {
    return this.rawImage && !this.docScanner.imageLoaded;
  }

  dispatchAndLeave(): void {
    this.purchaseId$
      .pipe(take(1))
      .subscribe((purchaseId: string) => {
        const routerCommands = [];
        if (purchaseId) {
          // Show snack message & exit method, if editor is in editing mode but there is no receipt
          if (!this.receiptScannerService.receipt) {
            this.snackBar.open('Did not get a receipt.');
            return;
          }
          // If the purchase already exists, update the receipt and navigate to the purchase-viewer
          this.store.dispatch(PurchaseActions.updateReceipt({
            receipt: this.receiptScannerService.receipt,
            purchaseId: purchaseId
          }));
          routerCommands.push('purchase', purchaseId);
        } else {
          // If the purchase does not exist yet, navigate to the editor-new
          routerCommands.push('new-purchase');
        }
        this.ngZone.run(() => {
          this.router.navigate(routerCommands);
        });
      });
  }

}
