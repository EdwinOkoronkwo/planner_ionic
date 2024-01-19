import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DeclarativetaskService } from './declarativetask.service';
import { NotificationService } from './notification.service';
import { INote } from '../models/INote.model';
import { Observable, forkJoin, merge } from 'rxjs';
import {
  catchError,
  concatMap,
  delay,
  map,
  scan,
  shareReplay,
  tap,
} from 'rxjs/operators';
import { BehaviorSubject, Subject, combineLatest, of, throwError } from 'rxjs';
import { CRUDAction } from '../models/ITask.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class DeclarativenoteService {
  // notes$ = this.http
  //   .get<INote[]>('http://localhost:5000/api/notes')
  //   .pipe(catchError(this.handleError), shareReplay(1));

  notes$ = this.api
    .get('notes')
    .pipe(catchError(this.handleError), shareReplay(1));

  tasks$ = this.taskService.tasksWithGoalsAndCRUD$.pipe(
    catchError(this.handleError),
    shareReplay(1)
  );
  status$ = of(['Not Done', 'Done']);
  importance$ = of(['Low', 'Medium', 'High']);

  // Combine two data streams
  notesWithTasks$ = combineLatest([this.notes$, this.tasks$]).pipe(
    delay(2000),
    map(([notes, tasks]) => {
      return notes.map((note: any) => {
        return {
          ...note,
          taskEndDate: tasks.find((task: any) => task.id === note.taskId)
            ?.end_date,
        } as INote;
      });
    }),
    shareReplay(1),
    // share(),
    catchError(this.handleError)
  );

  /***
   * Create CRUD Subject for add, delete and update
   */
  private noteCRUDSubject = new Subject<CRUDAction<INote>>();
  noteCRUDAction$ = this.noteCRUDSubject.asObservable();

  private noteCRUDCompleteSubject = new Subject<boolean>();
  noteCRUDCompleteAction$ = this.noteCRUDCompleteSubject.asObservable();

  addNote(note: INote) {
    this.noteCRUDSubject.next({ action: 'add', data: note });
  }

  updateNote(note: INote) {
    this.noteCRUDSubject.next({ action: 'update', data: note });
  }

  deleteNote(note: INote) {
    this.noteCRUDSubject.next({ action: 'delete', data: note });
  }

  // Need to merge students with CRUD actions
  notesWithTasksAndCRUD$ = merge(
    this.notesWithTasks$,
    this.noteCRUDAction$.pipe(
      concatMap((noteAction: any) =>
        this.saveNotes(noteAction).pipe(
          map((note) => ({ ...noteAction, data: note }))
        )
      )
    )
  ).pipe(
    scan((notes, value: any) => {
      return this.modifyNotes(notes, value);
    }, [] as INote[]),
    // shareReplay(1),
    // share(),
    shareReplay(1),
    catchError(this.handleError)
  );

  // Modify Students
  modifyNotes(notes: INote[], value: INote[] | CRUDAction<INote>) {
    if (!(value instanceof Array)) {
      if (value.action === 'add') {
        return [...notes, value.data];
      }
      if (value.action === 'update') {
        return notes.map((note) =>
          note.id === value.data.id ? value.data : note
        );
      }
      if (value.action === 'delete') {
        return notes.filter((note) => note.id !== value.data.id);
      }
    } else {
      return value;
    }
    return notes;
  }

  // save the students data to database
  saveNotes(noteAction: CRUDAction<INote>) {
    let noteDetails$!: Observable<INote>;
    if (noteAction.action === 'add') {
      noteDetails$ = this.addNoteToServer(noteAction.data).pipe(
        tap((note) => {
          this.notificationService.setSuccessMessage('Note Added Sucessfully!');
          this.noteCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (noteAction.action === 'update') {
      noteDetails$ = this.updateNoteToServer(noteAction.data).pipe(
        tap((note) => {
          this.notificationService.setSuccessMessage(
            'Note Updated Sucessfully!'
          );
          this.noteCRUDCompleteSubject.next(true);
        }),
        catchError(this.handleError)
      );
    }
    if (noteAction.action === 'delete') {
      return this.deleteNoteToServer(noteAction.data)
        .pipe(
          tap((note) => {
            this.notificationService.setSuccessMessage(
              'Note Deleted Sucessfully!'
            );
            this.noteCRUDCompleteSubject.next(true);
          }),
          catchError(this.handleError)
        )
        .pipe(map((note) => noteAction.data));
    }
    return noteDetails$.pipe(
      concatMap((note: any) =>
        this.taskService.tasksWithGoalsAndCRUD$.pipe(
          map((tasks) => {
            return {
              ...note,
              taskEndData: tasks.find((task) => task.id === note.taskId)
                ?.end_date,
            };
          })
        )
      ),
      //share(),
      shareReplay(1),
      catchError(this.handleError)
    );
  }

  addNoteToServer(note: INote) {
    // return this.http.post<INote>('http://localhost:5000/api/notes', note);
    return this.api.post('notes', note);
  }

  updateNoteToServer(note: INote) {
    // return this.http.patch<INote>(
    //   `http://localhost:5000/api/notes/${note.id}`,
    //   note
    // );
    return this.api.patch(`notes/${note.id}`, note);
  }

  deleteNoteToServer(note: INote) {
    // return this.http.delete<INote>(
    //   `http://localhost:5000/api/notes/${note.id}`
    // );
    return this.api.delete(`notes/${note.id}`);
  }

  /**************
   * Selecting a single note
   */
  private selectedNoteSubject = new BehaviorSubject<number>(0);
  selectedNoteAction$ = this.selectedNoteSubject.asObservable();

  selectNote(noteId: number) {
    this.selectedNoteSubject.next(noteId);
  }
  // Combine action data (from select) with data stream from note API
  note$ = combineLatest([
    this.notesWithTasksAndCRUD$,
    this.selectedNoteAction$,
  ]).pipe(
    map(([notes, selectedNoteId]) => {
      return notes.find((note: any) => note.id === selectedNoteId);
    }),
    //share(),
    shareReplay(1),
    catchError(this.handleError)
  );

  constructor(
    private http: HttpClient,
    private taskService: DeclarativetaskService,
    private notificationService: NotificationService,
    private api: ApiService
  ) {}

  handleError(error: Error) {
    return throwError(() => {
      return 'Unknown error occurred. Please try again.';
    });
  }
}
