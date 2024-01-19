import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DeclarativegoalService } from '../../../services/declarativegoal.service';
import { DeclarativetaskService } from '../../../services/declarativetask.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError, map, startWith, tap } from 'rxjs/operators';
import { EMPTY, combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { GlobalService } from 'src/services/global.service';
import {
  IonButton,
  IonDatetime,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
  IonText,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonInput,
    IonIcon,
    IonTextarea,
    IonDatetime,
    IonSelect,
    IonSelectOption,
    IonLabel,
    IonButton,
    IonList,
    IonItem,
    IonText,
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent {
  isLoading = false;
  taskId!: number;
  status$ = this.taskService.status$;
  goals$ = this.goalService.goals$;

  taskForm: any = new FormGroup({
    name: new FormControl(''),
    description: new FormControl(''),
    start_date: new FormControl(''),
    end_date: new FormControl(''),
    status: new FormControl(''),
    goalId: new FormControl(''),
  });

  selectedTaskId$ = this.route.paramMap.pipe(
    map((paramMap) => {
      let id = paramMap.get('id');
      if (id) this.taskId = +id;
      this.taskService.selectTask(this.taskId);
    })
  );

  task$ = this.taskService.task$.pipe(
    tap((task: any) => {
      if (task) this.taskId = task.id;
      task &&
        this.taskForm.setValue({
          name: task?.name,
          description: task?.description,
          start_date: task?.start_date,
          end_date: task?.end_date,
          status: task?.status,
          goalId: task?.goalId,
        });
    }),
    catchError((error) => {
      this.notificationService.setErrorMessage(error);
      return EMPTY;
    })
  );

  notification$ = this.taskService.taskCRUDCompleteAction$.pipe(
    startWith(false),
    tap((message) => {
      if (message) {
        this.router.navigateByUrl('/tabs/tab1');
      }
    })
  );
  viewModel$ = combineLatest([
    this.selectedTaskId$,
    this.task$,
    this.notification$,
  ]);

  constructor(
    private goalService: DeclarativegoalService,
    private taskService: DeclarativetaskService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private global: GlobalService // private categoryService: Declarative
  ) {}

  // onTaskSubmit = () => {
  //   this.isLoading = true;
  //   this.global.showLoader();
  //   let taskDetails = this.taskForm.value;
  //   if (this.taskId) {
  //     taskDetails = { ...taskDetails, id: this.taskId };
  //     this.taskService.updateTask(taskDetails);
  //     this.reset();
  //     this.global.successToast('Task was updated successfully!');
  //   } else {
  //     this.taskService.addTask(taskDetails);
  //     this.reset();
  //     this.global.successToast('Task was added successfully!');
  //   }
  // };

  onTaskSubmit() {
    this.isLoading = true;
    this.global.showLoader();
    let taskDetails = this.taskForm.value;
    if (this.taskId) {
      taskDetails = { ...taskDetails, id: this.taskId };
      this.taskService.updateTask(taskDetails);
      this.isLoading = false;
      this.global.hideLoader();
      this.router.navigateByUrl('/tabs/tab1');
      this.global.successToast('Task was updated successfully!');
      this.global.modalDismiss();
    } else {
      this.taskService.addTask(taskDetails);
      this.global.successToast('Task was added successfully!');
      this.isLoading = false;
      this.global.hideLoader();
    }
  }

  reset() {
    this.router.navigateByUrl('/tabs/tab1');
    this.isLoading = false;
    this.global.hideLoader();
  }

  // Getter
  get nameFormControl() {
    return this.taskForm.get('name');
    // return this.studentForm.controls['name'].value;
  }

  get descriptionFormControl() {
    return this.taskForm.get('description');
  }

  get startDateFormControl() {
    return this.taskForm.get('start_date');
  }

  get endDateFormControl() {
    return this.taskForm.get('end_date');
  }
  get statusFormControl() {
    return this.taskForm.get('status');
  }
  get goalIdFormControl() {
    return this.taskForm.get('goalId');
  }
}
