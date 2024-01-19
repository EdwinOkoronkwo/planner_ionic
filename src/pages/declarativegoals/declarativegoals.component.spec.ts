import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclarativegoalsComponent } from './declarativegoals.component';

describe('DeclarativegoalsComponent', () => {
  let component: DeclarativegoalsComponent;
  let fixture: ComponentFixture<DeclarativegoalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeclarativegoalsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeclarativegoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
