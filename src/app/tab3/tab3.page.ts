import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DeclarativegoalService } from '../../services/declarativegoal.service';
import { LoadingService } from '../../services/loading.service';
import { BehaviorSubject, EMPTY, catchError, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IGoal } from '../../models/IGoal.models';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonText,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { GlobalService } from 'src/services/global.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponent,
    CommonModule,
    RouterLink,
    IonButton,
    IonText,
  ],
})
export class Tab3Page implements OnInit {
  isLoading = false;
  errorMessageSubject = new BehaviorSubject<string>('');
  errorMessageAction$ = this.errorMessageSubject.asObservable();
  goals$ = this.goalService.goalsWithCRUD$.pipe(
    catchError((error: string) => {
      this.errorMessageSubject.next(error);
      return EMPTY;
    }),
    // map((goals) => {
    //   return goals.filter((goal: any) => goal.status === 'Done');
    // }),
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
