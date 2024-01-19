import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclarativetasksComponent } from './declarativetasks.component';

describe('DeclarativetasksComponent', () => {
  let component: DeclarativetasksComponent;
  let fixture: ComponentFixture<DeclarativetasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeclarativetasksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeclarativetasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
