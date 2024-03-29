import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DeclarativetaskService } from '../../services/declarativetask.service';
import { DeclarativenoteService } from '../../services/declarativenote.service';
import { LoadingService } from '../../services/loading.service';
import {
  BehaviorSubject,
  EMPTY,
  catchError,
  combineLatest,
  map,
  tap,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { INote } from 'src/models/INote.model';
import { GlobalService } from 'src/services/global.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
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
  ],
})
export class Tab2Page {
  isLoading = false;
  selectedTaskSubject = new BehaviorSubject<number>(0);
  selectedTaskAction$ = this.selectedTaskSubject.asObservable();
  selectedTaskId!: number;
  errorMessageSubject = new BehaviorSubject<string>('');
  errorMessageAction$ = this.errorMessageSubject.asObservable();
  notes$ = this.noteService.notesWithTasksAndCRUD$.pipe(
    catchError((error: string) => {
      this.errorMessageSubject.next(error);
      return EMPTY;
    })
  );
  tasks$ = this.taskService.tasksWithGoalsAndCRUD$;

  //Combining action stream from select with data stream from Students API
  filteredNotes$ = combineLatest([this.notes$, this.selectedTaskAction$]).pipe(
    tap((data) => {
      this.isLoading = false;
      this.global.hideLoader();
    }),
    map(([notes, selectedTaskId]) => {
      return notes.filter((note) =>
        selectedTaskId ? note.taskId === selectedTaskId : true
      );
    })
  );

  constructor(
    private taskService: DeclarativetaskService,
    private noteService: DeclarativenoteService,
    private global: GlobalService
  ) {}

  ngOnInit(): void {
    this.global.showLoader();
  }

  onTaskChange(event: Event) {
    let selectedTaskId = parseInt((event.target as HTMLSelectElement).value);
    this.selectedTaskSubject.next(selectedTaskId);
  }

  onDeleteNote(note: INote) {
    this.global.showAlert(
      'Are you sure you want to delete this note?',
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
            this.deleteNote(note);
          },
        },
      ]
    );
  }

  async deleteNote(note: any) {
    try {
      this.global.showLoader();
      await this.noteService.deleteNote(note);
      this.global.hideLoader();
      this.global.successToast('Note deleted successfully!');
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
