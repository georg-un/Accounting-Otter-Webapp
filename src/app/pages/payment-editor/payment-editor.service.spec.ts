import { TestBed } from '@angular/core/testing';

import { PaymentEditorService } from './payment-editor.service';
import { TestingModule } from '../../core/testing/testing.module';

describe('PaymentEditorService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      TestingModule
    ]
  }));

  it('should be created', () => {
    const service: PaymentEditorService = TestBed.get(PaymentEditorService);
    expect(service).toBeTruthy();
  });
});
