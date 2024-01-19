import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IGoal } from '../models/IGoal.models';
import {
  catchError,
  concatMap,
  map,
  scan,
  shareReplay,
  tap,
} from 'rxjs/operators';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  merge,
  of,
  throwError,
} from 'rxjs';
import { CRUDAction } from '../models/ITask.model';
import { NotificationService } from './notification.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class DeclarativegoalService {
  goals$ = this.api.get('goals').pipe(shareReplay(1));

  status$ = of(['Not Done', 'Done']);

  /***
   * Create CRUD Subject for add, delete and update
   */
  private goalCRUDSubject = new Subject<CRUDAction<IGoal>>();
  goalCRUDAction$ = this.goalCRUDSubject.asObservable();

  private goalCRUDCompleteSubject = new Subject<boolean>();
  goalCRUDCompleteAction$ = this.goalCRUDCompleteSubject.asObservable();

  addGoal(goal: IGoal) {
    this.goalCRUDSubject.next({ action: 'add', data: goal });
  }

  updateGoal(goal: IGoal) {
    this.goalCRUDSubject.next({ action: 'update', data: goal });
  }

  deleteGoal(goal: IGoal) {
    this.goalCRUDSubject.next({ action: 'delete', data: goal });
  }

  // Need to merge students with CRUD actions
  goalsWithCRUD$ = merge(
    this.goals$,
    this.goalCRUDAction$.pipe(
      concatMap((goalAction: any) =>
        this.saveGoals(goalAction).pipe(
          map((goal: any) => ({ ...goalAction, data: goal }))
        )
      )
    )
  ).pipe(
    scan((goals: any, value: any) => {
      return this.modifyGoals(goals, value);
    }, [] as IGoal[]),
    shareReplay(1),
    catchError(this.handleError)
  );

  // Modify Students
  modifyGoals(goals: IGoal[], value: IGoal[] | CRUDAction<IGoal>) {
    if (!(value instanceof Array)) {
      if (value.action === 'add') {
        return [...goals, value.data];
      }
      if (value.action === 'update') {
        return goals.map((goal) =>
          goal.id === value.data.id ? value.data : goal
        );
      }
      if (value.action === 'delete') {
        return goals.filter((goal) => goal.id !== value.data.id);
      }
    } else {
      return value;
    }
    return goals;
  }

  // save the students data to database
  saveGoals(goalAction: CRUDAction<IGoal>) {
    let goalDetails$!: Observable<IGoal>;
    if (goalAction.action === 'add') {
      goalDetails$ = this.addGoalToServer(goalAction.data).pipe(
        tap((goal) => {
          this.notificationService.setSuccessMessage('Goal Added Sucessfully!');
          this.goalCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (goalAction.action === 'update') {
      goalDetails$ = this.updateGoalToServer(goalAction.data).pipe(
        tap((goal) => {
          this.notificationService.setSuccessMessage(
            'Goal Updated Sucessfully!'
          );
          this.goalCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (goalAction.action === 'delete') {
      return this.deleteGoalToServer(goalAction.data)
        .pipe(
          tap((goal) => {
            this.notificationService.setSuccessMessage(
              'Goal Deleted Sucessfully!'
            );
            this.goalCRUDCompleteSubject.next(true);
          }),
          catchError(this.handleError)
        )
        .pipe(map((goal) => goalAction.data));
    }
    return goalDetails$.pipe(shareReplay(1), catchError(this.handleError));
  }

  addGoalToServer(goal: IGoal) {
    return this.api.post('goals', goal);
  }

  updateGoalToServer(goal: IGoal) {
    return this.api.patch(`goals/${goal.id}`, goal);
  }

  deleteGoalToServer(goal: IGoal) {
    return this.api.delete(`goals/${goal.id}`);
  }

  /**************
   * Selecting a single goal
   */
  private selectedGoalSubject = new BehaviorSubject<number>(0);
  selectedGoalAction$ = this.selectedGoalSubject.asObservable();

  selectGoal(goalId: number) {
    this.selectedGoalSubject.next(goalId);
  }
  // Combine action data (from select) with data stream from goal API
  goal$ = combineLatest([this.goalsWithCRUD$, this.selectedGoalAction$]).pipe(
    map(([goals, selectedGoalId]) => {
      return goals.find((goal: any) => goal.id === selectedGoalId);
    }),
    shareReplay(1),
    catchError(this.handleError)
  );

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private api: ApiService
  ) {}

  handleError(error: Error) {
    return throwError(() => {
      return 'Unknown error occurred. Please try again.';
    });
  }
}
