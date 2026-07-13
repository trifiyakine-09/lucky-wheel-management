import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cadeaux } from './cadeaux';

describe('Cadeaux', () => {
  let component: Cadeaux;
  let fixture: ComponentFixture<Cadeaux>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cadeaux],
    }).compileComponents();

    fixture = TestBed.createComponent(Cadeaux);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
