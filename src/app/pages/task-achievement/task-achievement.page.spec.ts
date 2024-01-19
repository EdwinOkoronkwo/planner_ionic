import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskAchievementPage } from './task-achievement.page';

describe('TaskAchievementPage', () => {
  let component: TaskAchievementPage;
  let fixture: ComponentFixture<TaskAchievementPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TaskAchievementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
