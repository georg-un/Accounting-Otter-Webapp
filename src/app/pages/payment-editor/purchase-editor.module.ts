import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseEditorNewComponent } from './purchase/purchase-editor-new.component';
import { FormsModule } from '@angular/forms';
import { PurchaseEditorEditComponent } from './purchase/purchase-editor-edit.component';
import { QrScannerComponent } from '../qr-scanner/qr-scanner.component';
import { QrScannerModule } from '../qr-scanner/qr-scanner.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    PurchaseEditorNewComponent,
    PurchaseEditorEditComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatIconModule,
    MatCheckboxModule,
    MatListModule,
    MatMenuModule,
    MatInputModule,
    MatButtonModule,
    QrScannerModule
  ],
  entryComponents: [
    QrScannerComponent
  ]
})
export class PurchaseEditorModule { }
