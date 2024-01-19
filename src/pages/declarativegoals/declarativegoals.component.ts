import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DeclarativegoalService } from '../../services/declarativegoal.service';
import { LoadingService } from '../../services/loading.service';
import { BehaviorSubject, EMPTY, catchError, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IGoal } from '../../models/IGoal.models';

@Component({
  selector: 'app-declarativegoals',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './declarativegoals.component.html',
  styleUrl: './declarativegoals.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeclarativegoalsComponent {
  errorMessageSubject = new BehaviorSubject<string>('');
  errorMessageAction$ = this.errorMessageSubject.asObservable();
  goals$ = this.goalService.goalsWithCRUD$.pipe(
    catchError((error: string) => {
      this.errorMessageSubject.next(error);
      return EMPTY;
    }),
    tap((data) => {
      this.loadingService.hideLoader();
    })
  );

  constructor(
    //private taskService: DeclarativetaskService,
    private goalService: DeclarativegoalService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadingService.showLoader();
  }

  onDeleteGoal(goal: IGoal) {
    if (confirm('Are you sure you want to delete?')) {
      this.goalService.deleteGoal(goal);
    }
  }
}
