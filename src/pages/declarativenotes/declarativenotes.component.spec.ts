import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclarativenotesComponent } from './declarativenotes.component';

describe('DeclarativenotesComponent', () => {
  let component: DeclarativenotesComponent;
  let fixture: ComponentFixture<DeclarativenotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeclarativenotesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeclarativenotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
