import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentEditorService {

  addPurchaseTrigger: Subject<boolean> = new Subject();  // TODO: Replace this by an ngrx action

  constructor() { }

  emitAddPurchaseTrigger(): void {
    this.addPurchaseTrigger.next(true);
  }

}
