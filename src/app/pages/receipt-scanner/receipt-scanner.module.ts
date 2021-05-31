import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceiptScannerComponent } from './receipt-scanner.component';
import { NgxDocumentScannerModule, OpenCVConfig } from '@fino-ngx-doc-scanner';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';


const openCVConfig: OpenCVConfig = {
  openCVDirPath: './assets'
};


@NgModule({
  declarations: [
    ReceiptScannerComponent
  ],
  imports: [
    CommonModule,
    NgxDocumentScannerModule.forRoot(openCVConfig),
    MatProgressSpinnerModule,
    RouterModule
  ]
})
export class ReceiptScannerModule { }
