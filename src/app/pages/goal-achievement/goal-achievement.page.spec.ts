import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoalAchievementPage } from './goal-achievement.page';

describe('GoalAchievementPage', () => {
  let component: GoalAchievementPage;
  let fixture: ComponentFixture<GoalAchievementPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(GoalAchievementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
