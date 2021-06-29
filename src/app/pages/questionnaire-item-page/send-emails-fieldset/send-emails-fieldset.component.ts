import { Component, OnInit, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { map, delay, takeUntil, take } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ValidationErrors } from '@angular/forms';

import {
    RootStoreState,
    QuestionnaireStoreActions,
    QuestionnaireStoreSelectors
} from '@app/root-store';
import { Questionnaire, SendEmailTemplate } from '@app/models';
import { InformationDialogComponent, ConfirmationDialogComponent } from '@app/components';
import { QuestionnairesService, ValidationService, TooltipService } from '@app/services';
import { isIE } from '@app/utils';
import { EmailTemplates } from '@app/enums';

import { AddTemplateComponent } from '../add-template/add-template.component';

@Component({
  selector: 'app-send-emails-fieldset',
  templateUrl: './send-emails-fieldset.component.html',
  styleUrls: ['./send-emails-fieldset.component.scss']
})
export class SendEmailsFieldsetComponent implements OnInit, OnDestroy {

  private _item: Questionnaire;
  @Input()
  set item(item: Questionnaire) {
    this._item = item;
    this.reset();
  }
  get item(): Questionnaire {
    return this._item;
  }

  private _enabledSend: boolean;
  @Input()
  set enabledSend(enabledSend: boolean) {
    this._enabledSend = enabledSend;
  }
  get enabledSend(): boolean {
    return this._enabledSend;
  }

  private _templates: SendEmailTemplate[] = [];
  @Input()
  set templates(templates: SendEmailTemplate[]) {
    this.sortTemplates(templates);
    this._templates = templates;
    if (this.chosenTemplate) {
      const obj = this._templates.find(tpl => tpl.id === this.chosenTemplate.id);
      if (obj) {
        this.chosenTemplate = obj;
        this.updateTemplate(this.chosenTemplate);
      }
    }
  }
  get templates(): SendEmailTemplate[] {
    return this._templates;
  }

  @Input() type: string = '';
  @Input() chosenTemplate: SendEmailTemplate;

  @Output() refresh = new EventEmitter();
  @Output() send = new EventEmitter();
  @Output() chosen: EventEmitter<SendEmailTemplate> = new EventEmitter();

  form: FormGroup;
  templatesControl = new FormControl();
  selectedTemplate: SendEmailTemplate;
  pristineDescription: string = '';
  pristineSubject: string = '';
  pristineTemplate: string = '';
  formPristine: boolean = true;
  important: number = 0;

  validating: boolean = false;
  sendBtnTooltipText: string = '';
  showValidation: boolean = false;

  private destroySubject$: Subject<void> = new Subject();

  constructor(
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private questionnairesService: QuestionnairesService,
    private tooltipService: TooltipService,
    private validationService: ValidationService) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      'email_desc': ['', [Validators.required], this.validateTemplate.bind(this)],
      'email_subject': ['', [Validators.required]],
      'tpl_content': ['', [Validators.required]]
    });

    this.templatesControl.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(value => {
        if (!value) return;

        const obj: SendEmailTemplate = this.templates.find((key) => (key.id === value));
        this.updateFields(obj);
        this.chosen.emit(obj);
      });

    this.form.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(form => {
        if (!this.selectedTemplate) { return; }
        this.store$.pipe(
          take(1),
          select(QuestionnaireStoreSelectors.selectUnsavedTemplates))
          .subscribe((templates: SendEmailTemplate[]) => {
            const tpl = form;
            tpl.id = this.selectedTemplate.id;
            const obj = templates.find(t => t.id === tpl.id);
            if (form.email_desc === this.pristineDescription &&
              form.email_subject === this.pristineSubject &&
              form.tpl_content === this.pristineTemplate) {
              this.formPristine = true;
              this.store$.dispatch(new QuestionnaireStoreActions.SetHasUnsavedTemplateAction(false));
              if (obj) {
                this.store$.dispatch(new QuestionnaireStoreActions.RemoveUnsavedTemplateAction(obj));
              }
            } else {
              this.formPristine = false;
              this.store$.dispatch(new QuestionnaireStoreActions.SetHasUnsavedTemplateAction(true));
              if (obj) {
                this.store$.dispatch(new QuestionnaireStoreActions.RemoveUnsavedTemplateAction(obj));
              }
              this.store$.dispatch(new QuestionnaireStoreActions.AddUnsavedTemplateAction(tpl));
            }
        });
      });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  private getEmailTemplateName() {
    switch (this.type) {
      case EmailTemplates.INV:
        return 'Invitation';
      case EmailTemplates.REM:
        return 'Reminder';
      case EmailTemplates.INV_RES:
          return 'Result';
      default:
        return '';
    }
  }

  /**
   * Sort templates first by ids (for old templates after DB migration 'updatedAt' equals),
   * and the second - by 'updatedAt' dates
   * @param templates (SendEmailTemplate[])
   */
  private sortTemplates(templates: SendEmailTemplate[]) {
    templates.sort(function (valueA, valueB) {
      return valueB.id - valueA.id;
    });
    templates.sort(function (valueA, valueB) {
      return new Date(valueB.updatedAt).getTime() - new Date(valueA.updatedAt).getTime();
    });
  }

  /**
   * Updates template fields.
   * Saves chosen template id into the root store through parent component.
   * @param template (SendEmailTemplate)
   */
  private updateTemplate(template: SendEmailTemplate) {
    if (!template) { this.templatesControl.reset(); }
    else { this.templatesControl.setValue(template.id); }
    this.chosen.emit(template ? template : null);
    this.updateFields(template);
  }

  private updateFields(obj: SendEmailTemplate) {
    this.selectedTemplate = obj;

    this.pristineDescription = obj ? obj.email_desc : '';
    this.pristineSubject = obj ? obj.email_subject : '';
    this.pristineTemplate = obj ? obj.tpl_content : '';
    this.form.get('email_desc').setValue(obj ? obj.email_desc : '');
    this.form.get('email_subject').setValue(obj ? obj.email_subject : '');
    this.form.get('tpl_content').setValue(obj ? obj.tpl_content : '');
    this.important = obj.important;

    this.formPristine = true;
    if (this.enabledSend) {
      this.sendBtnTooltipText = '';
    }
  }

  reset() {
    if (this.form) {
      this.updateTemplate(null);
    }
  }

  getControl(name: string): AbstractControl {
    return this.form.controls[name];
  }

  validateTemplate(control: AbstractControl): Observable<ValidationErrors> {
    this.validating = true;
    const params = this.item.id + ',' +
                   this.type + ',' +
                   control.value;
    return this.validationService.isQuestionnaireTemplateValid(params)
    .pipe(
      delay(500),
      map(res => {
        this.validating = false;

        const sameDescr = (this.selectedTemplate && (this.selectedTemplate.email_desc === control.value))
          ? true : false;
        const resp = (sameDescr || res) ? null : { templateTaken: true };
        return resp;
    }));
  }

  addTemplate() {
    const template = {} as SendEmailTemplate;
    template.email_type = this.type;
    template.quest_id = this.item.id;
    const dialogRef = this.openAddTemplateDialog(template, 'Create New Template', false);
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((data: SendEmailTemplate) => {
        if (data) {
          data.email_type = this.type;
          data.quest_id = this.item.id;
          data.important = 0;
          this.questionnairesService.createTemplate([data])
          .subscribe((item: SendEmailTemplate) => {
            this.refresh.emit();
            this.updateTemplate(item);
          }, err => {
            this.openInformationDialog(err.message, 'Error');
          });
        }
      });
  }

  deleteTemplate() {
    const item: SendEmailTemplate = this.selectedTemplate;
    if (!item) return;

    const text = 'Are you sure you want to delete selected email Template?';
    const dialogRef = this.openConfirmationDialog(text, 'Confirmation Delete');
    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroySubject$))
    .subscribe((data: any) => {
      if (data) {
        this.questionnairesService.deleteTemplate(item.id).subscribe(() => {
          this.refresh.emit();
          this.updateTemplate(null);
        }, err => {
          this.openInformationDialog(err.message, 'Error');
        });
      }
    });

  }

  cloneTemplate() {
    const template: SendEmailTemplate = JSON.parse(JSON.stringify(this.selectedTemplate));
    if (!template) return;

    template.email_desc = template.email_desc + ' - Clone';
    const dialogRef = this.openAddTemplateDialog(template, 'Clone Template', false);
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((data: SendEmailTemplate) => {
        if (data) {
          data.email_type = this.type;
          data.quest_id = this.item.id;
          data.important = template.important;
          this.questionnairesService.createTemplate([data]).subscribe((item: SendEmailTemplate) => {
            this.refresh.emit();
            this.updateTemplate(item);
          }, err => {
            this.openInformationDialog(err.message, 'Error');
          });
        }
      });
  }

  editTemplate() {
    this.showValidation = true;
    if (this.form.invalid || this.validating || (this.selectedTemplate && this.formPristine)) { return; }

    const data: SendEmailTemplate = {...this.form.value};
    data.email_type = this.type;
    data.quest_id = this.item.id;
    data.important = this.important;
    if (!this.selectedTemplate) {
      this.questionnairesService.createTemplate([data])
          .subscribe((item: SendEmailTemplate) => {
            this.refresh.emit();
            this.updateTemplate(item);
          }, err => {
            this.openInformationDialog(err.message, 'Error');
          });
        return;
    }
    const template: SendEmailTemplate = this.selectedTemplate;
    data.id = template.id;
    //data.important = template.important;
    this.questionnairesService.updateTemplates([data])
    .subscribe((msg) => {
      this.refresh.emit();
      this.updateTemplate(data);

      this.openInformationDialog('Template updated', 'Information');
    }, err => {
      this.openInformationDialog(err.message, 'Error');
    });
  }

  onUpdateImportant () {
    this.formPristine = false;
  }

  onSend ($event) {
    this.showValidation = true;
    if (!this.selectedTemplate || !this.enabledSend) {
      this.showSendBtnTooltip($event);
      this.send.emit({template: null});
      return;
    }
    this.sendBtnTooltipText = '';
    const template: SendEmailTemplate = {...this.form.value};
    template.important = this.important;
    template.quest_id = this.selectedTemplate.quest_id;
    template.email_type = this.selectedTemplate.email_type;
    if (!template) return;
    this.send.emit({template: template});
  }

  /**
   * Shows notification tooltip
   */
  private showSendBtnTooltip($event) {
    if (!isIE()) {
      this.tooltipService.reset();
      const enterEmailTest = this.type !== EmailTemplates.INV_RES ? ' (or enter email)' : '';
      this.sendBtnTooltipText = `Please select a Key, Participants${enterEmailTest} and ${this.getEmailTemplateName()} email template`;
      this.tooltipService.createTooltip($event.target.parentElement, 'bottom-start', this.sendBtnTooltipText, 'error-tooltip', false);
    }
  }

  /**
   * Hides notification tooltip
   */
  sendBtnOut($event) {
    if (!isIE()) {
      this.tooltipService.reset();
    }
  }

  private openAddTemplateDialog(item: SendEmailTemplate, header: string, edit: boolean): MatDialogRef<any> {
    return this.dialog.open(AddTemplateComponent, <any>{
      disableClose: true,
      width: '650px',
      data: {
        item: item,
        header: header,
        edit: edit
      }
    });
  }

  private openConfirmationDialog(text: string, title: string): MatDialogRef<any> {
    return this.dialog.open(ConfirmationDialogComponent, <any>{
      width: '500px',
      data: {
        title: title,
        text: text
      }
    });
  }

  private openInformationDialog(text: string, title: string): MatDialogRef<any> {
    return this.dialog.open(InformationDialogComponent, <any>{
      width: '400px',
      data: {
        title: title,
        text: text,
        noTimer: true
      }
    });
  }

}
