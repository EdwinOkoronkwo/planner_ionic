import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DeclarativenoteService } from '../../../services/declarativenote.service';
import { DeclarativetaskService } from '../../../services/declarativetask.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError, map, startWith, tap } from 'rxjs/operators';
import { EMPTY, combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { GlobalService } from 'src/services/global.service';

@Component({
  selector: 'app-note-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './note-form.component.html',
  styleUrl: './note-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteFormComponent {
  noteId!: number;
  isLoading = false;
  importance$ = this.taskService.importance$;
  tasks$ = this.taskService.tasksWithGoalsAndCRUD$;

  noteForm: any = new FormGroup({
    name: new FormControl(''),
    details: new FormControl(''),
    importance: new FormControl(''),
    taskId: new FormControl(''),
  });

  selectedNoteId$ = this.route.paramMap.pipe(
    map((paramMap: any) => {
      let id = paramMap.get('id');
      if (id) this.noteId = +id;
      this.noteService.selectNote(this.noteId);
    })
  );

  note$ = this.noteService.note$.pipe(
    tap((note: any) => {
      if (note) this.noteId = note.id;
      note &&
        this.noteForm.setValue({
          name: note?.name,
          details: note?.details,
          importance: note?.importance,
          taskId: note?.taskId,
        });
    }),
    catchError((error) => {
      this.notificationService.setErrorMessage(error);
      return EMPTY;
    })
  );

  notification$ = this.noteService.noteCRUDCompleteAction$.pipe(
    startWith(false),
    tap((message) => {
      if (message) {
        this.router.navigateByUrl('/tabs/tab2');
      }
    })
  );
  viewModel$ = combineLatest([
    this.selectedNoteId$,
    this.note$,
    this.notification$,
  ]);

  constructor(
    private noteService: DeclarativenoteService,
    private taskService: DeclarativetaskService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private global: GlobalService
  ) {}

  onNoteSubmit() {
    this.isLoading = true;
    this.global.showLoader();
    let noteDetails = this.noteForm.value;
    if (this.noteId) {
      noteDetails = { ...noteDetails, id: this.noteId };
      this.noteService.updateNote(noteDetails);
      this.reset();
      this.global.successToast('Note was updated successfully!');
    } else {
      this.noteService.addNote(noteDetails);
      this.reset();
      this.global.successToast('Note was added successfully!');
    }
  }

  reset() {
    this.router.navigateByUrl('/tabs/tab2');
    this.isLoading = false;
    this.global.hideLoader();
  }
}
