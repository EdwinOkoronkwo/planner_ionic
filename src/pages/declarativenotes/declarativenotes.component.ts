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

@Component({
  selector: 'app-declarativenotes',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './declarativenotes.component.html',
  styleUrl: './declarativenotes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeclarativenotesComponent {
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
      this.loadingService.hideLoader();
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
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadingService.showLoader();
  }

  onTaskChange(event: Event) {
    let selectedTaskId = parseInt((event.target as HTMLSelectElement).value);
    this.selectedTaskSubject.next(selectedTaskId);
  }
}
