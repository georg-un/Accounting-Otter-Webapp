import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseEditorNewComponent } from './purchase-editor-new.component';
import { TestingModule } from '../../../core/testing/testing.module';
import { MaterialTestingModule } from '../../../core/testing/material-testing.module';
import { FormsModule } from '@angular/forms';

describe('PurchaseEditorNewComponent', () => {
  let component: PurchaseEditorNewComponent;
  let fixture: ComponentFixture<PurchaseEditorNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestingModule,
        MaterialTestingModule,
        FormsModule,
      ],
      declarations: [ PurchaseEditorNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseEditorNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
