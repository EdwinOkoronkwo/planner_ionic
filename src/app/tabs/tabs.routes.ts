import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadComponent: () =>
          import('../tab1/tab1.page').then((m) => m.Tab1Page),
      },
      {
        path: 'edit-task/:id',
        loadComponent: () =>
          import('../tab1/task-form/task-form.component').then(
            (m) => m.TaskFormComponent
          ),
      },

      {
        path: 'add-task',
        loadComponent: () =>
          import('../tab1/task-form/task-form.component').then(
            (m) => m.TaskFormComponent
          ),
      },
      {
        path: 'tab2',
        loadComponent: () =>
          import('../tab2/tab2.page').then((m) => m.Tab2Page),
      },
      {
        path: 'edit-note/:id',
        loadComponent: () =>
          import('../tab2/note-form/note-form.component').then(
            (m) => m.NoteFormComponent
          ),
      },

      {
        path: 'add-note',
        loadComponent: () =>
          import('../tab2/note-form/note-form.component').then(
            (m) => m.NoteFormComponent
          ),
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../tab3/tab3.page').then((m) => m.Tab3Page),
      },
      {
        path: 'edit-goal/:id',
        loadComponent: () =>
          import('../tab3/goal-form/goal-form.component').then(
            (m) => m.GoalFormComponent
          ),
      },

      {
        path: 'add-goal',
        loadComponent: () =>
          import('../tab3/goal-form/goal-form.component').then(
            (m) => m.GoalFormComponent
          ),
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];
