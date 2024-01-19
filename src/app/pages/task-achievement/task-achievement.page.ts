import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {
  BehaviorSubject,
  EMPTY,
  catchError,
  combineLatest,
  map,
  tap,
} from 'rxjs';
import { ITask } from 'src/models/ITask.model';
import { GlobalService } from 'src/services/global.service';
import { DeclarativegoalService } from 'src/services/declarativegoal.service';
import { DeclarativetaskService } from 'src/services/declarativetask.service';

@Component({
  selector: 'app-task-achievement',
  templateUrl: './task-achievement.page.html',
  styleUrls: ['./task-achievement.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class TaskAchievementPage implements OnInit {
  isLoading = false;
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
  status$ = this.taskService.status$;

  //Combining action stream from select with data stream from Students API
  filteredTasks$ = combineLatest([this.tasks$, this.selectedGoalAction$]).pipe(
    tap((data) => {
      this.isLoading = false;
      this.global.hideLoader();
    }),
    map(([tasks, selectedGoalId]) => {
      return tasks.filter(
        (task) =>
          (selectedGoalId ? task.goalId === selectedGoalId : true) &&
          task.status === 'Done'
      );
    })
  );

  constructor(
    private taskService: DeclarativetaskService,
    private goalService: DeclarativegoalService,
    private global: GlobalService
  ) {}

  ngOnInit(): void {
    this.global.showLoader();
  }

  onGoalChange(event: Event) {
    let selectedGoalId = parseInt((event.target as HTMLSelectElement).value);
    this.selectedGoalSubject.next(selectedGoalId);
  }

  onDeleteTask(task: ITask) {
    this.global.showAlert(
      'Are you sure you want to delete this task?',
      'Confirm',
      [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('cancel');
            return;
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.deleteTask(task);
          },
        },
      ]
    );
  }

  async deleteTask(task: any) {
    try {
      this.global.showLoader();
      await this.taskService.deleteTask(task);
      this.global.hideLoader();
      this.global.successToast('Task deleted successfully!');
    } catch (e: any) {
      console.log(e);
      this.global.hideLoader();
      let msg;
      if (e?.error?.message) {
        msg = e.error.message;
      }
      this.global.errorToast(msg);
    }
  }
}
