import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'goal-achievement',
    loadComponent: () => import('./pages/goal-achievement/goal-achievement.page').then( m => m.GoalAchievementPage)
  },
  {
    path: 'task-achievement',
    loadComponent: () => import('./pages/task-achievement/task-achievement.page').then( m => m.TaskAchievementPage)
  },
];
