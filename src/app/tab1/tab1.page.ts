import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
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
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { ITask } from 'src/models/ITask.model';
import { GlobalService } from 'src/services/global.service';
import { TaskFormComponent } from './task-form/task-form.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponent,
    RouterLink,
    CommonModule,
    IonButton,
    IonText,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
  ],
})
export class Tab1Page {
  isLoading = false;
  selectedGoalSubject = new BehaviorSubject<number>(0);
  selectedGoalAction$ = this.selectedGoalSubject.asObservable();
  // selectedStatusSubject = new BehaviorSubject<string>('');
  // selectedStatusAction$ = this.selectedStatusSubject.asObservable();
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
  filteredTasks$ = combineLatest([
    this.tasks$,
    this.selectedGoalAction$,
    // this.selectedStatusAction$,
  ]).pipe(
    tap((data) => {
      // this.loadingService.hideLoader();
      this.isLoading = false;
      this.global.hideLoader();
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
  async modalAdd() {
    const options = {
      component: TaskFormComponent,
      componentProps: {
        from: 'tab1',
      },
      cssClass: 'home-modal',
      swipeToClose: true,
    };
    await this.global.createModal(options);
  }
}
