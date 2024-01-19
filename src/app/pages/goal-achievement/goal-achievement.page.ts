import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject, EMPTY, catchError, map, tap } from 'rxjs';
import { GlobalService } from 'src/services/global.service';
import { DeclarativegoalService } from 'src/services/declarativegoal.service';
import { IGoal } from 'src/models/IGoal.models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-goal-achievement',
  templateUrl: './goal-achievement.page.html',
  styleUrls: ['./goal-achievement.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink],
})
export class GoalAchievementPage implements OnInit {
  isLoading = false;
  errorMessageSubject = new BehaviorSubject<string>('');
  errorMessageAction$ = this.errorMessageSubject.asObservable();
  goals$ = this.goalService.goalsWithCRUD$.pipe(
    catchError((error: string) => {
      this.errorMessageSubject.next(error);
      return EMPTY;
    }),
    map((goals: any[]) => {
      return goals.filter((goal: any) => goal.status === 'Done');
    }),
    tap((data) => {
      this.isLoading = false;
      this.global.hideLoader();
    })
  );

  constructor(
    private goalService: DeclarativegoalService,
    private global: GlobalService
  ) {}

  ngOnInit(): void {
    this.global.showLoader();
  }

  onDeleteGoal(goal: IGoal) {
    this.global.showAlert(
      'Are you sure you want to delete this goal?',
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
            this.deleteGoal(goal);
          },
        },
      ]
    );
  }

  async deleteGoal(goal: any) {
    try {
      this.global.showLoader();
      await this.goalService.deleteGoal(goal);
      this.global.hideLoader();
      this.global.successToast('Goal deleted successfully!');
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
