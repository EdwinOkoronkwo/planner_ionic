import { Injectable } from '@angular/core';
import { CRUDAction, ITask } from '../models/ITask.model';
import { Observable, forkJoin, merge } from 'rxjs';
import {
  catchError,
  concatMap,
  delay,
  map,
  scan,
  shareReplay,
  tap,
} from 'rxjs/operators';
import { BehaviorSubject, Subject, combineLatest, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DeclarativegoalService } from './declarativegoal.service';

import { NotificationService } from './notification.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class DeclarativetaskService {
  tasks$ = this.api
    .get('tasks')
    .pipe(catchError(this.handleError), shareReplay(1));
  goals$ = this.goalService.goals$.pipe(
    catchError(this.handleError),
    shareReplay(1)
  );
  status$ = of(['Not Done', 'Done']);
  importance$ = of(['Low', 'Medium', 'High']);

  // Combine two data streams
  tasksWithGoals$ = combineLatest([this.tasks$, this.goals$]).pipe(
    delay(2000),
    map(([tasks, goals]) => {
      return tasks.map((task: any) => {
        return {
          ...task,
          goalName: goals.find((goal: any) => goal.id === task.goalId)?.name,
        } as ITask;
      });
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  /***
   * Create CRUD Subject for add, delete and update
   */
  private taskCRUDSubject = new Subject<CRUDAction<ITask>>();
  taskCRUDAction$ = this.taskCRUDSubject.asObservable();

  private taskCRUDCompleteSubject = new Subject<boolean>();
  taskCRUDCompleteAction$ = this.taskCRUDCompleteSubject.asObservable();

  addTask(task: ITask) {
    this.taskCRUDSubject.next({ action: 'add', data: task });
  }

  updateTask(task: ITask) {
    this.taskCRUDSubject.next({ action: 'update', data: task });
  }

  deleteTask(task: ITask) {
    this.taskCRUDSubject.next({ action: 'delete', data: task });
  }

  // Need to merge students with CRUD actions
  tasksWithGoalsAndCRUD$ = merge(
    this.tasksWithGoals$,
    this.taskCRUDAction$.pipe(
      concatMap((taskAction: any) =>
        this.saveTasks(taskAction).pipe(
          map((task) => ({ ...taskAction, data: task }))
        )
      )
    )
  ).pipe(
    scan((tasks, value: any) => {
      return this.modifyTasks(tasks, value);
    }, [] as ITask[]),
    shareReplay(1),
    catchError(this.handleError)
  );

  // Modify Students
  modifyTasks(tasks: ITask[], value: ITask[] | CRUDAction<ITask>) {
    if (!(value instanceof Array)) {
      if (value.action === 'add') {
        return [...tasks, value.data];
      }
      if (value.action === 'update') {
        return tasks.map((task) =>
          task.id === value.data.id ? value.data : task
        );
      }
      if (value.action === 'delete') {
        return tasks.filter((task) => task.id !== value.data.id);
      }
    } else {
      return value;
    }
    return tasks;
  }

  // save the students data to database
  saveTasks(taskAction: CRUDAction<ITask>) {
    let taskDetails$!: Observable<ITask>;
    if (taskAction.action === 'add') {
      taskDetails$ = this.addTaskToServer(taskAction.data).pipe(
        tap((task) => {
          this.notificationService.setSuccessMessage('Task Added Sucessfully!');
          this.taskCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (taskAction.action === 'update') {
      taskDetails$ = this.updateTaskToServer(taskAction.data).pipe(
        tap((task) => {
          this.notificationService.setSuccessMessage(
            'Task Updated Sucessfully!'
          );
          this.taskCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (taskAction.action === 'delete') {
      return this.deleteTaskToServer(taskAction.data)
        .pipe(
          tap((task) => {
            this.notificationService.setSuccessMessage(
              'Task Deleted Sucessfully!'
            );
            this.taskCRUDCompleteSubject.next(true);
          }),
          catchError(this.handleError)
        )
        .pipe(map((task) => taskAction.data));
    }
    return taskDetails$.pipe(
      concatMap((task: any) =>
        this.goalService.goals$.pipe(
          map((goals) => {
            return {
              ...task,
              goalName: goals.find((goal: any) => goal.id === task.goalId)
                ?.name,
            };
          })
        )
      ),
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  addTaskToServer(task: ITask) {
    return this.api.post('tasks', task);
  }

  updateTaskToServer(task: ITask) {
    return this.api.patch(`tasks/${task.id}`, task);
  }

  deleteTaskToServer(task: ITask) {
    return this.api.delete(`tasks/${task.id}`);
  }

  /**************
   * Selecting a single task
   */
  private selectedTaskSubject = new BehaviorSubject<number>(0);
  selectedTaskAction$ = this.selectedTaskSubject.asObservable();

  selectTask(taskId: number) {
    this.selectedTaskSubject.next(taskId);
  }
  // Combine action data (from select) with data stream from task API
  task$ = combineLatest([
    this.tasksWithGoalsAndCRUD$,
    this.selectedTaskAction$,
  ]).pipe(
    map(([tasks, selectedTaskId]) => {
      return tasks.find((task: any) => task.id === selectedTaskId);
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  constructor(
    private http: HttpClient,
    private goalService: DeclarativegoalService,
    private notificationService: NotificationService,
    private api: ApiService
  ) {}

  handleError(error: Error) {
    return throwError(() => {
      return 'Unknown error occurred. Please try again.';
    });
  }
}
