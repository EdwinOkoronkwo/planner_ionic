import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DeclarativegoalService } from '../../../services/declarativegoal.service';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError, map, startWith, tap } from 'rxjs/operators';
import { EMPTY, combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { GlobalService } from 'src/services/global.service';

@Component({
  selector: 'app-goal-form',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './goal-form.component.html',
  styleUrl: './goal-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalFormComponent {
  isLoading = false;
  goalId!: number;
  status$ = this.goalService.status$;

  goalForm: any = new FormGroup({
    name: new FormControl(''),
    description: new FormControl(''),
    start_date: new FormControl(''),
    end_date: new FormControl(''),
    status: new FormControl(''),
  });

  selectedGoalId$ = this.route.paramMap.pipe(
    map((paramMap) => {
      let id = paramMap.get('id');
      if (id) this.goalId = +id;
      this.goalService.selectGoal(this.goalId);
    })
  );

  goal$ = this.goalService.goal$.pipe(
    tap((goal: any) => {
      if (goal) this.goalId = goal.id;
      goal &&
        this.goalForm.setValue({
          name: goal?.name,
          description: goal?.description,
          start_date: goal?.start_date,
          end_date: goal?.end_date,
          status: goal?.status,
        });
    }),
    catchError((error) => {
      this.notificationService.setErrorMessage(error);
      return EMPTY;
    })
  );

  notification$ = this.goalService.goalCRUDCompleteAction$.pipe(
    startWith(false),
    tap((message) => {
      if (message) {
        this.router.navigateByUrl('/tabs/tab3');
      }
    })
  );
  viewModel$ = combineLatest([
    this.selectedGoalId$,
    this.notification$,
    this.goal$,
  ]);

  constructor(
    private goalService: DeclarativegoalService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private global: GlobalService
  ) {}

  onGoalSubmit() {
    this.isLoading = true;
    this.global.showLoader();
    let goalDetails = this.goalForm.value;
    if (this.goalId) {
      goalDetails = { ...goalDetails, id: this.goalId };
      this.goalService.updateGoal(goalDetails);
      this.reset();
      this.global.successToast('Goal was updated successfully!');
    } else {
      this.goalService.addGoal(goalDetails);
      this.reset();
      this.global.successToast('Note was added successfully!');
    }
  }

  reset() {
    this.router.navigateByUrl('/tabs/tab3');
    this.isLoading = false;
    this.global.hideLoader();
  }
}
