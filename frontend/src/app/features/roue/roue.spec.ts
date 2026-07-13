import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Roue } from './roue';

describe('Roue', () => {
  let component: Roue;
  let fixture: ComponentFixture<Roue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Roue],
    }).compileComponents();

    fixture = TestBed.createComponent(Roue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
