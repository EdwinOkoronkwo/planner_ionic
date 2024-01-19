import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  BehaviorSubject,
  EMPTY,
  catchError,
  combineLatest,
  map,
  tap,
} from 'rxjs';
import { DeclarativetaskService } from '../../services/declarativetask.service';
import { DeclarativegoalService } from '../../services/declarativegoal.service';
import { LoadingService } from '../../services/loading.service';
import { IGoal } from 'src/models/IGoal.models';
import { ITask } from 'src/models/ITask.model';

@Component({
  selector: 'app-declarativetasks',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, RouterLinkActive],
  templateUrl: './declarativetasks.component.html',
  styleUrl: './declarativetasks.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeclarativeTasksComponent implements OnInit {
  selectedGoalSubject = new BehaviorSubject<number>(0);
  selectedGoalAction$ = this.selectedGoalSubject.asObservable();
  selectedGoalId!: number;
  errorMessageSubject = new BehaviorSubject<string>('');
  errorMessageAction$ = this.errorMessageSubject.asObservable();
  tasks$ = this.taskService.tasksWithGoalsAndCRUD$.pipe(
    catchError((error: string) => {
      this.errorMessageSubject.next(error);
      return EMPTY;
    })
  );
  goals$ = this.goalService.goals$;

  //Combining action stream from select with data stream from Students API
  filteredTasks$ = combineLatest([this.tasks$, this.selectedGoalAction$]).pipe(
    tap((data) => {
      this.loadingService.hideLoader();
    }),
    map(([tasks, selectedGoalId]) => {
      return tasks.filter((task) =>
        selectedGoalId ? task.goalId === selectedGoalId : true
      );
    })
  );

  constructor(
    private taskService: DeclarativetaskService,
    private goalService: DeclarativegoalService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadingService.showLoader();
  }

  onGoalChange(event: Event) {
    let selectedGoalId = parseInt((event.target as HTMLSelectElement).value);
    this.selectedGoalSubject.next(selectedGoalId);
  }

  onDeleteTask(task: ITask) {
    if (confirm('Are you sure you want to delete?')) {
      this.taskService.deleteTask(task);
    }
  }
}
