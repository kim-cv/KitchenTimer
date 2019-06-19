import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTimerComponent } from './add-timer.component';

describe('AddTimerComponent', () => {
  let component: AddTimerComponent;
  let fixture: ComponentFixture<AddTimerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTimerComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
