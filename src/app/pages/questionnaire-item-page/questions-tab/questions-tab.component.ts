import { Component, OnInit, OnDestroy, Input, HostListener,
  EventEmitter, Output } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { takeUntil, take } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material';

import {
  RootStoreState,
  QuestionnaireStoreActions,
  QuestionnaireStoreSelectors,
  QuestionStoreActions
} from '@app/root-store';

import { Questionnaire, QuestionGroup, Question, QuestionQroupQuestionMap } from '@app/models';
import { InformationDialogComponent, ConfirmationDialogComponent } from '@app/components';
import { QuestionModalComponent } from '@app/pages/questions/question-modal/question-modal.component';
import { CreateGroupComponent } from '../create-group/create-group.component';
import { QuestionGroupService, QuestionService } from '@app/services';

export enum KEY_CODE {
  CTRL = 17,
  SHIFT = 16
}

@Component({
  selector: 'app-questions-tab',
  templateUrl: './questions-tab.component.html',
  styleUrls: ['./questions-tab.component.scss']
})
export class QuestionsTabComponent implements OnInit, OnDestroy {

  @Input() item: Questionnaire;
  @Output() reload = new EventEmitter();
  loading: boolean = false;
  groups: QuestionGroup[] = [];
  unassignedQuestions: Question[] = [];

  ctrlPressed: boolean = false;
  shiftPressed: boolean = false;

  selectedItems: QuestionQroupQuestionMap[] = [];
  selectedUnasignedItems: Question[] = [];
  selectedGroups: QuestionGroup[] = [];
  unassignedOpened: boolean = false;
  unassignedSelected: boolean = false;
  unassignedAllowDrop: boolean = false;

  private destroySubject$: Subject<void> = new Subject();

  constructor(
    private store$: Store<RootStoreState.State>,
    private questionGroupService: QuestionGroupService,
    private questionService: QuestionService,
    private dialog: MatDialog
  ) { }

  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: KeyboardEvent) {
    if (event.keyCode === KEY_CODE.CTRL) {
      this.ctrlPressed = true;
    } else if (event.keyCode === KEY_CODE.SHIFT) {
      this.shiftPressed = true;
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyUpEvent(event: KeyboardEvent) {
    this.ctrlPressed = false;
    this.shiftPressed = false;
  }

  ngOnInit() {
    combineLatest(
      this.store$.select(state => state.questionnaire.sorted_groups),
      this.store$.select(state => state.questionnaire.unassignedQuestionsSelected)
    ).pipe(
      takeUntil(this.destroySubject$))
      .subscribe(([groups, questions]) => {
        if (groups && questions) {
          /**Deep clone groups with included questions to leave immutable groups in store */
          this.groups = JSON.parse(JSON.stringify(groups));
          this.unassignedQuestions = JSON.parse(JSON.stringify(questions));
          this.unassignedQuestions = Object.values(this.unassignedQuestions).filter((e) => (e.quest_type === this.item.type));

          this.selectedItems = [];
          this.selectedGroups = [];
          this.selectedUnasignedItems = [];
          this.groups.forEach(group => {
            if (group.selected) {
              this.selectedGroups.push(group);
            }
            group.group_questions_map.forEach(item => {
              /**Remove from unassigned questions which included to question groups */
              this.unassignedQuestions = this.unassignedQuestions.filter((e) => (e.id !== item.question.id));
              if (item.selected) {
                this.selectedItems.push(item);
              }
            });
          });

          this.unassignedQuestions.forEach((question: Question) => {
            if (question.selected) {
              this.selectedUnasignedItems.push(question);
            }
          });

          this.store$.pipe(
            take(1),
            select(QuestionnaireStoreSelectors.selectSearchValue)
          ).subscribe((searchValue: string) => {
            this.filterBySearch(searchValue);
          });

          this.loading = false;
        }
      });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  setLoading(value: boolean) {
    this.loading = value;
  }

  /**
   * Sets state for triggered group (true/false).
   * Adds/Removes triggered group id to root store.
   * @param $event (Event)
   * @param group (triggered Group)
   */
  triggerFolder($event: Event, group: any) {
    $event.stopPropagation();
    group.opened = group.opened ? false : true;
    if (group.opened)
      this.store$.dispatch(new QuestionnaireStoreActions.AddOpenedGroupIdAction(group.id));
    else
      this.store$.dispatch(new QuestionnaireStoreActions.RemoveOpenedGroupIdAction(group.id));
  }

  triggerUnassigned($event: Event) {
    this.unassignedOpened = !this.unassignedOpened;
    $event.stopPropagation();
  }

  /**
   * Clears selected groups and selected unassigned questions.
   * If 'Ctrl' pressed selects (if not selected yet)/ deselects question.
   * If 'Shift' pressed selects the range of questions between just selected question and last selected (if exists).
   * Else deselects all previously selected questions and selects current.
   * Adds/Removes selected/deselected questions to root store.
   * @param item (selected question)
   */
  selectItem(item: any) {
    this.clearGroups();
    if (this.selectedUnasignedItems.length > 0) this.clearUnasignedItems();

    if (this.ctrlPressed) {
      const obj = this.selectedItems.find((key) => (key.question.id === item.question.id));
      if (obj) {
        obj.selected = false;
        this.selectedItems = this.selectedItems.filter((e) => (e.question.id !== item.question.id));
        this.store$.dispatch(new QuestionnaireStoreActions.RemoveSelectedItemIdAction(item.question.id));
      } else {
        item.selected = true;
        this.selectedItems.push(item);
        this.store$.dispatch(new QuestionnaireStoreActions.AddSelectedItemIdAction(item.question.id));
      }
    } else if (this.shiftPressed && this.selectedItems.length &&
      (item.question_group_id === this.selectedItems[this.selectedItems.length - 1].question_group_id)) {

      const lastItem = this.selectedItems[this.selectedItems.length - 1];
      this.clearItems();

      const group = this.groups.find((key) => (key.id === item.question_group_id));
      let max = group.group_questions_map.findIndex(el => el.question.id === item.question.id);
      let min = group.group_questions_map.findIndex(el => el.question.id === lastItem.question.id);
      if (min > max) {
        const tmp = min;
        min = max;
        max = tmp;
      }
      for (let i = min; i <= max; i++) {
        const elem = group.group_questions_map[i];
        elem.selected = true;
        this.selectedItems.push(elem);
        this.store$.dispatch(new QuestionnaireStoreActions.AddSelectedItemIdAction(elem.question.id));
      }
    } else {
      this.clearItems();
      item.selected = true;
      this.selectedItems = [item];
      this.store$.dispatch(new QuestionnaireStoreActions.AddSelectedItemIdAction(item.question.id));
    }
  }
 /**
   * Clears selected groups and selected assigned questions.
   * If 'Ctrl' pressed selects (if not selected yet)/ deselects question.
   * If 'Shift' pressed selects the range of questions between just selected question and last selected (if exists).
   * Else deselects all previously selected questions and selects current.
   * Adds/Removes selected/deselected questions to root store.
   * @param item (selected unassigned question)
   */
  selectUnassignedItem(item: Question) {
    this.clearGroups();
    if (this.selectedItems.length > 0) this.clearItems();

    if (this.ctrlPressed) {
      const obj = this.selectedUnasignedItems.find((key) => (key.id === item.id));
      if (obj) {
        obj.selected = false;
        this.selectedUnasignedItems = this.selectedUnasignedItems.filter((e) => (e.id !== item.id));
        this.store$.dispatch(new QuestionnaireStoreActions.RemoveSelectedItemIdAction(item.id));
      } else {
        item.selected = true;
        this.selectedUnasignedItems.push(item);
        this.store$.dispatch(new QuestionnaireStoreActions.AddSelectedItemIdAction(item.id));
      }
    } else if (this.shiftPressed && this.selectedUnasignedItems.length) {

      const lastItem = this.selectedUnasignedItems[this.selectedUnasignedItems.length - 1];
      this.clearUnasignedItems();

      let max = this.unassignedQuestions.findIndex(el => el.id === item.id);
      let min = this.unassignedQuestions.findIndex(el => el.id === lastItem.id);
      if (min > max) {
        const tmp = min;
        min = max;
        max = tmp;
      }
      for (let i = min; i <= max; i++) {
        const elem = this.unassignedQuestions[i];
        elem.selected = true;
        this.selectedUnasignedItems.push(elem);
        this.store$.dispatch(new QuestionnaireStoreActions.AddSelectedItemIdAction(elem.id));
      }
    } else {
      this.clearUnasignedItems();
      item.selected = true;
      this.selectedUnasignedItems = [item];
      this.store$.dispatch(new QuestionnaireStoreActions.AddSelectedItemIdAction(item.id));
    }
  }

  /**
   * Clears selected unassigned and selected assigned questions.
   * If 'Ctrl' pressed selects (if not selected yet)/ deselects group.
   * Else deselects all previously selected groups and selects current.
   * Adds/Removes selected/deselected groups to root store.
   * @param item (selected group)
   */
  selectGroup(item: any) {
    this.clearItems();
    this.clearUnasignedItems();

    if (this.ctrlPressed) {
      const obj = this.selectedGroups.find((key) => (key.id === item.id));
      if (obj) {
        obj.selected = false;
        this.selectedGroups = this.selectedGroups.filter((e) => (e.id !== item.id));
        this.store$.dispatch(new QuestionnaireStoreActions.RemoveSelectedGroupIdAction(item.id));
      } else {
        item.selected = true;
        this.selectedGroups.push(item);
        this.store$.dispatch(new QuestionnaireStoreActions.AddSelectedGroupIdAction(item.id));
      }
    } else {
      this.clearGroups();
      item.selected = true;
      this.selectedGroups = [item];
      this.store$.dispatch(new QuestionnaireStoreActions.AddSelectedGroupIdAction(item.id));
    }
  }

  /**
   * Clears selected groups, selected unassigned and selected assigned questions.
   * Selects 'Unassigned' folder.
   */
  selectUnassigned() {
    this.clearItems();
    this.clearGroups();
    this.clearUnasignedItems();
    this.unassignedSelected = true;
  }

  /**
   * If question not selected yet and ctrl or shift doesn't pressed,
   * Clears selected groups, selected assigned and selected unassigned questions.
   * Selects question on which 'mousedown' event is trigered.
   * Adds selected question to root store.
   * @param item (assigned question)
   */
  onItemMouseDown(item: QuestionQroupQuestionMap) {
    const obj = this.selectedItems.find((key) => (key.question.id === item.question.id) );
    if (obj || this.ctrlPressed || this.shiftPressed) return;

    item.selected = true;
    this.selectQuestion(item.question.id);
    this.selectedItems = [item];
  }

  /**
   * Clears selected groups, selected assigned and selected unassigned questions.
   * Adds selected question to root store.
   * @param item (assigned question)
   */
  private selectQuestion(questionId) {
    this.clearGroups();
    this.clearUnasignedItems();

    this.clearItems();
    this.store$.dispatch(new QuestionnaireStoreActions.AddSelectedItemIdAction(questionId));
  }

  /**
   * If unassigned question not selected yet and ctrl or shift doesn't pressed,
   * Clears selected groups, selected assigned and selected unassigned questions.
   * Selects unassigned question on which 'mousedown' event is trigered.
   * Adds selected question to root store.
   * @param item (unassigned question)
   */
  onUnassignedItemMouseDown(item: Question) {
    const obj = this.selectedUnasignedItems.find((key) => (key.id === item.id) );
    if (obj || this.ctrlPressed || this.shiftPressed) return;

    item.selected = true;
    this.selectQuestion(item.id);
    this.selectedUnasignedItems = [item];
  }

  /**
   * If group not selected yet and ctrl doesn't pressed,
   * Clears selected groups, selected assigned and selected unassigned questions.
   * Selects group on which 'mousedown' event is trigered.
   * Adds selected group to root store.
   * @param item (group)
   */
  onGroupMouseDown(group: any) {
    const obj = this.selectedGroups.find((key) => (key.id === group.id) );
    if (obj || this.ctrlPressed) return;

    group.selected = true;
    this.clearItems();
    this.clearUnasignedItems();

    this.clearGroups();
    this.selectedGroups = [group];
    this.store$.dispatch(new QuestionnaireStoreActions.AddSelectedGroupIdAction(group.id));
  }

  /**
   * Sets 'selected' state to false for each assigned question.
   * Then cleares selectedItems array.
   * And cleares selected questions array in root store.
   */
  private clearItems() {
    this.selectedItems.forEach(elem => {
      elem.selected = false;
    });
    this.selectedItems = [];
    this.store$.dispatch(new QuestionnaireStoreActions.ClearSelectedItemsIdsAction());
  }
  /**
   * Sets 'selected' state to false for each unassigned question.
   * Then cleares selectedUnasignedItems array.
   * And cleares selected questions array in root store.
   */
  private clearUnasignedItems() {
    this.selectedUnasignedItems.forEach(elem => {
      elem.selected = false;
    });
    this.selectedUnasignedItems = [];
    this.store$.dispatch(new QuestionnaireStoreActions.ClearSelectedItemsIdsAction());
  }
  /**
   * Sets 'selected' state to false for each group.
   * Then cleares selectedGroups array.
   * And cleares selected groups array in root store.
   */
  private clearGroups() {
    this.unassignedSelected = false;
    this.selectedGroups.forEach(elem => {
      elem.selected = false;
    });
    this.selectedGroups = [];
    this.store$.dispatch(new QuestionnaireStoreActions.ClearSelectedGroupsIdsAction());
  }

  reset() {
    this.clearItems();
    this.clearUnasignedItems();
    this.clearGroups();
    this.store$.dispatch(new QuestionnaireStoreActions.ClearOpenedGroupsIdsAction());
    this.unassignedOpened = false;
    this.loading = false;
  }

  /**
   * Returns string with selected questions ids separated by comma.
   */
  private getSelectedQuestionsIds(): string {
    let ids = '';
    if (this.selectedUnasignedItems.length) {
      this.selectedUnasignedItems.forEach((question: Question) => {
        ids += question.id;
        ids += ',';
      });
    } else {
      this.selectedItems.forEach((map: QuestionQroupQuestionMap) => {
        ids += map.question_id;
        ids += ',';
      });
    }
    return ids;
  }

  /**
   * Returns selected Question object.
   */
  private getSelectedQuestion(): Question {
    let question: Question;
    if (this.selectedUnasignedItems.length) {
      question = this.selectedUnasignedItems[this.selectedUnasignedItems.length - 1];
    } else if (this.selectedItems.length) {
      question = this.selectedItems[this.selectedItems.length - 1].question;
    }
    return question;
  }

  /**
   * Returns data {items, group_id, isCopy?} configured
   * from selected assigned/unassigned questions (by logic could be selected only one of them)
   * @param groupId ('MoveTo' group id)
   */
  private getSelectedQuestionsToMove(groupId: number) {
    const items = [];
    this.selectedItems.forEach((item) => {
      items.push({question_group_id: item.question_group_id, question_id: item.question_id});
    });

    this.selectedUnasignedItems.forEach((item) => {
      items.push({question_group_id: groupId, question_id: item.id});
    });

    return items;
  }

  /**
   * Deletes selected questions from their group
   * and adds them to selected group.
   * Or (if isCopy passed) just adds them to selected group.
   * @param group ('MoveTo' group id)
   */
  private moveQuestionsToGroup (groupId: number) {
    const items = this.getSelectedQuestionsToMove(groupId);
    this.moveToGroup({items: items, group_id: groupId});
  }

  /**
   * Calls api to Move/Copy questions
   * @param data (
   *  - items: questions that should be moved,
   *  - group_id: 'MoveTo' group id,
   *  - isCopy: passed if questions should be only copied to the group)
   */
  private moveToGroup(data: {items, group_id, isCopy?}) {
    this.questionGroupService.moveToGroup(data).subscribe(() => {
      this.reload.emit();
      this.loading = false;
    }, err => {
      this.openInformationDialog(err.message, 'Error');
    });
  }

  /**
   * Deletes selected questions from their group
   * and they automatically move to UNASSIGNED folder.
   * @param group ('MoveTo' group)
   */
  private moveQuestionsToUnassigned () {
    const items = [];

    if (this.selectedItems.length > 0) {
      this.selectedItems.forEach((item) => {
        items.push({question_group_id: item.question_group_id, question_id: item.question_id});
      });

      this.questionGroupService.deleteMaps({items: items}).subscribe(() => {
        this.reload.emit();
      }, err => {
        this.openInformationDialog(err.message, 'Error');
      });
    }
  }

  /**
   * If there are selected assigned questions,
   * moves passed question under last selected and Selects the question.
   * @param question (Question that should be moved)
   */
  private moveUnderLastSelectedQuestion(question: Question): boolean {
    if (this.selectedItems.length) {
      const lastQ: QuestionQroupQuestionMap = this.selectedItems[this.selectedItems.length - 1];
      const items = [{question_group_id: lastQ.question_group_id, question_id: question.id}];
      this.selectQuestion(question.id);
      this.questionGroupService
      .moveToItem({items: items, group_id: lastQ.question_group_id, order: lastQ.question_order})
      .subscribe(() => {
        this.reload.emit();
        this.loading = false;
      }, err => {
        this.openInformationDialog(err.message, 'Error');
      });
      return true;
    }
    return false;
  }

/**D&D LOGIC *****************************************************************************/
  allowDrop($event: Event, group: any) {
    const obj = this.selectedGroups.find((key) => (key.id === group.id) );
    if (!obj) {
      $event.preventDefault();
      group.alowDrop = true;
    }
  }

  allowDropOnItem($event: Event, item: any) {
    const obj = this.selectedItems.find((key) => (key.question.id === item.question.id));
    if ((!obj && this.selectedItems.length > 0) || this.selectedUnasignedItems.length > 0) {
      $event.preventDefault();
      item.alowDrop = true;
    }
  }

  allowDropOnUnassigned($event: Event, item: any) {
    if (this.selectedItems.length > 0) {
      $event.preventDefault();
      if (item) item.alowDrop = true;
      else this.unassignedAllowDrop = true;
    }
  }

  dragLeave(elem: any) {
    elem.alowDrop = false;
    this.unassignedAllowDrop = false;
  }

  onDragStart($event: any) {
    $event.dataTransfer.setData('Text', $event.target.id);
    const el = document.getElementById($event.target.id);

    const crt = <HTMLElement>el.cloneNode(true);
    let count = (this.selectedItems.length) ? this.selectedItems.length : this.selectedGroups.length;
    if (!count) count = this.selectedUnasignedItems.length;

    crt.innerHTML = count + ' selected node';
    crt.classList.add('custom-drag-ghost');
    document.body.appendChild(crt);
    $event.dataTransfer.setDragImage(crt, 0, 0);
  }

  dropOnGroup($event: Event, group: QuestionGroup) {
    $event.preventDefault();
    document.getElementsByClassName('custom-drag-ghost')[0].remove();

    if (this.selectedItems.length > 0 || this.selectedUnasignedItems.length > 0) {
      this.moveQuestionsToGroup(group.id);
    } else if (this.selectedGroups.length > 0) {
      const items = [];
      this.selectedGroups.forEach((item) => {
        items.push({id: item.id});
      });

      this.questionGroupService.sortGroup({
        items: items,
        questionnaire_id: group.questionnaire_id,
        order: group.order_pos}).subscribe(() => {
        this.reload.emit();
      }, err => {
        this.openInformationDialog(err.message, 'Error');
      });
    }
  }

  dropOnUnassigned($event: Event) {
    $event.preventDefault();
    document.getElementsByClassName('custom-drag-ghost')[0].remove();

    this.moveQuestionsToUnassigned();
  }

  dropOnItem($event: Event, q: any) {
    $event.preventDefault();
    document.getElementsByClassName('custom-drag-ghost')[0].remove();

    const items = this.getSelectedQuestionsToMove(q.question_group_id);

    this.questionGroupService
    .moveToItem({items: items, group_id: q.question_group_id, order: q.question_order})
    .subscribe(() => {
      this.reload.emit();
    }, err => {
      this.openInformationDialog(err.message, 'Error');
    });
  }

  onDragEnd($event: Event) {
    $event.preventDefault();
    document.getElementsByClassName('custom-drag-ghost')[0].remove();
  }
/**End D&D LOGIC *************************************************************************/

  createGroup() {
    const dialogRef = this.openCreateGroupDialog(null, 'Create new Question Group');
    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroySubject$))
    .subscribe((data: any) => {
      if (data) {
        data.questionnaire_id = this.item.id;
        this.questionGroupService.create(data).subscribe(() => {
          this.reload.emit();
        }, err => {
          this.openInformationDialog(err.message, 'Error');
        });
      }
    });
  }

  editGroup() {
    const group = this.selectedGroups[0];
    const dialogRef = this.openCreateGroupDialog(group, 'Edit Question Group');
    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroySubject$))
    .subscribe((data: any) => {
      if (data) {
        data.id = group.id;
        this.questionGroupService.update(data).subscribe(() => {
          this.reload.emit();
        }, err => {
          this.openInformationDialog(err.message, 'Error');
        });
      }
    });
  }

  deleteGroups() {
    const ids = [];
    this.selectedGroups.forEach((group: QuestionGroup) => {
      ids.push(group.id);
    });
    const text = 'Are you sure you want to delete ' + this.selectedGroups.length + ' selected Groups?';
    const dialogRef = this.openConfirmationDialog(text);
    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroySubject$))
    .subscribe((data: any) => {
      if (data) {
        this.questionGroupService.delete(ids).subscribe(() => {
          this.reload.emit();
        }, err => {
          this.openInformationDialog(err.message, 'Error');
        });
      }
    });
  }

  /**
   * Creates new question and If there are selected assigned questions,
   * moves new question into the last selected question's group.
   * Selects new question.
   */
  createQuestion() {
    const dialogRef = this.openDialog('Create new Question', 'add', null);
    dialogRef.afterClosed().subscribe((question: Question) => {
      if (question) {
        this.loading = true;
        this.questionService.create(question).subscribe(
          (q: Question) => {
            if (!this.moveUnderLastSelectedQuestion(q)) {
              this.selectQuestion(q.id);
              this.reload.emit();
              this.loading = false;
            }
          }, err => {
            this.openInformationDialog(err.message, 'Error');
          });
      }
    });
  }

/**
 * Deletes questions by ids.
 * Expected req.params on server: string with questions ids separated by comma
 * or only one id.
 * Updates questions list on 'Questions' page.
 */
  deleteQuestions() {
    const length: number = this.selectedItems.length
      ? this.selectedItems.length
      : this.selectedUnasignedItems.length;
    const ids = this.getSelectedQuestionsIds();

    const text = 'Are you sure you want to delete ' + length + ' selected questions?';
    const dialogRef = this.openConfirmationDialog(text);
    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroySubject$))
    .subscribe((data: any) => {
      if (data) {
        this.questionService.delete(ids).subscribe(() => {
          this.reload.emit();
          this.store$.dispatch(new QuestionStoreActions.LoadRequestAction(-1));
        }, err => {
          this.openInformationDialog(err.message, 'Error');
        });
      }
    });
  }

  editQuestion(question?: Question) {
    if (!question) { question = this.getSelectedQuestion(); }
    if (!question) { return; }

    const dialogRef = this.openDialog('Edit Question', 'edit', question);
    dialogRef.afterClosed().subscribe((editedQuestion: Question) => {
      if (editedQuestion) {
        this.loading = true;
        this.questionService.edit(editedQuestion).subscribe(() => {
          this.reload.emit();
        });
      }
    });
  }

  /**
   * First: Opens 'Copy Question' dialog (adds '- Copy' to question's title).
   * If original question's title was changed: creates new question,
   * if not: edits selected question.
   * Second: Copies created/edited (or pristine) question into the chosen in menu group.
   * @param copyTo (group to which selected question should be copied)
   */
  copyQuestion(copyTo: QuestionGroup) {
    const question = this.getSelectedQuestion();
    if (!question) { return; }
    const dialogRef = this.openDialog('Copy Question', 'copy', question);
    dialogRef.afterClosed().pipe(takeUntil(this.destroySubject$)).subscribe((data: Question) => {
      if (data) {
        this.loading = true;
        if (question.title === data.title) {
          this.questionService.edit(data).subscribe(() => {
            const items = [{question_group_id: copyTo.id, question_id: question.id}];
            this.moveToGroup({items: items, group_id: copyTo.id, isCopy: true});
          });
        } else {
          data.id = undefined;
          this.questionService.create(data).subscribe((q: Question) => {
            const items = [{question_group_id: copyTo.id, question_id: q.id}];
            this.moveToGroup({items: items, group_id: copyTo.id, isCopy: true});
          });
        }
      }
    });
  }

  /**
   * Moves selected questions (deletes them (if they belongs to group) from that qroup)
   * into the group selected in menu.
   * @param moveTogroup (QuestionGroup to which selected questions should be moved)
   */
  moveQuestion(moveTogroup: QuestionGroup) {
    if (moveTogroup.id === -1) { this.moveQuestionsToUnassigned(); }
    else { this.moveQuestionsToGroup(moveTogroup.id); }
  }

  /**
   * Applies search filter to all questions: unassigned and in groups.
   * @param value (entered by user search value)
   */
  filterBySearch(value: string) {
    const transformedFilter = value.trim().toLowerCase();
    this.unassignedQuestions.forEach((question: Question) => {
      const searchValue = question.title.toLowerCase().replace(/<[^>]*>/g, '');
      if (searchValue.includes(transformedFilter)) {
        question.hidden = false;
      } else {
        question.hidden = true;
      }
    });
    this.groups.forEach((group) => {
      group.group_questions_map.forEach((map: QuestionQroupQuestionMap) => {
        const searchValue = map.question.title.toLowerCase().replace(/<[^>]*>/g, '');
        if (searchValue.includes(transformedFilter)) {
          map.hidden = false;
        } else {
          map.hidden = true;
        }
      });
    });
  }

  /**
   * Resets search filter.
   */
  clearSearchFilter() {
    this.unassignedQuestions.forEach((question: Question) => {
      question.hidden = false;
    });
    this.groups.forEach((group) => {
      group.group_questions_map.forEach((map: QuestionQroupQuestionMap) => {
        map.hidden = false;
      });
    });
  }

  private openInformationDialog(text: string, title: string): MatDialogRef<any> {
    return this.dialog.open(InformationDialogComponent, <any>{
      width: '400px',
      data: {
        title: title,
        text: text
      }
    });
  }

  private openCreateGroupDialog(group: QuestionGroup, header: string): MatDialogRef<any> {
    return this.dialog.open(CreateGroupComponent, <any>{
      width: '550px',
      data: {
        header: header,
        group: group
      }
    });
  }


  private openConfirmationDialog(text: string): MatDialogRef<any> {
    return this.dialog.open(ConfirmationDialogComponent, <any>{
      width: '450px',
      data: {
        text: text
      }
    });
  }

  private openDialog(header: string, type: string, question: Question): MatDialogRef<any> {
    return this.dialog.open(QuestionModalComponent, <any> {
      disableClose: true,
      width: '1000px',
      data: {
        modalType: type,
        header: header,
        question: question
      }
    });
  }

}
