import { NgModule } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { AngularDraggableModule } from 'angular2-draggable';
import { MatMenuModule } from '@angular/material/menu';
import { ClipboardModule } from 'ngx-clipboard';

import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from '@app/_shared/shared.module';

import {
  AuthGuardService,
  AdminService,
  KeysService,
  TooltipService,
  ValidationService,
  TrainingCourseService,
  ModalPositionCacheService,
  ShowDialogService
} from '@app/services';

import {SidebarComponent} from '@app/components/sidebar/sidebar.component';
import {SbProfilesComponent} from '@app/components/sidebar/sb-profiles/sb-profiles.component';
import {LogInComponent} from '@app/pages/log-in/log-in.component';
import {AdminComponent} from '@app/pages/admin/admin.component';
import {WelcomeComponent} from '@app/pages/welcome/welcome.component';
import {UserAdministrationComponent} from '@app/pages/user-administration/user-administration.component';
import {KeysComponent} from '@app/pages/keys/keys.component';
import {KeysModalComponent} from '@app/pages/keys/keys-modal/keys.modal.component';
import {ConfigurationComponent} from '@app/pages/configuration/configuration.component';
import {ConfigurationFieldComponent} from '@app/pages/configuration/configuration-field/configuration-field.component';
import {TrainingCoursesComponent} from '@app/pages/training-courses/training-courses.component';
import {TrainingCourseModalComponent} from '@app/pages/training-courses/training-courses-modal/training-course-modal.component';
import {PreviewDialogComponent} from '@app/components/dialog/preview-dialog/preview-dialog.component';

/** Participants */
import {ParticipantsComponent} from '@app/pages/participants/participants.component';
import {
  StatusRendererComponent,
  SelectAllRendererComponent,
  AddParticipantDialogComponent,
  UpdateFieldsComponent,
  ChangeStatusComponent,
  DeleteAttemptComponent
} from '@app/pages/participants';

import { ImportParticipantsComponent } from '@app/pages/import-participants/import-participants.component';
import { EmailCellRendererComponent } from '@app/pages/import-participants/email-cell-renderer/email-cell-renderer.component';
import { DateCellRendererComponent } from '@app/pages/import-participants/date-cell-renderer/date-cell-renderer.component';
import { NameCellRendererComponent } from '@app/pages/import-participants/name-cell-renderer/name-cell-renderer.component';
import { GridComponent } from '@app/pages/import-participants/grid/grid.component';
import { ResultDialogComponent } from '@app/pages/import-participants/result-dialog/result-dialog.component';

import { QuestionnairePageComponent } from '@app/pages/questionnaire/questionnaire.component';
import { QuestionnaireAddPageComponent } from '@app/pages/questionnaire-add-page/questionnaire-add-page.component';
import { QuestionnaireItemPageComponent } from '@app/pages/questionnaire-item-page/questionnaire-item-page.component';
import { IncompleteAttemptsComponent } from '@app/pages/questionnaire-item-page/incomplete-attempts/incomplete-attempts.component';
import { QuestionsTabComponent } from '@app/pages/questionnaire-item-page/questions-tab/questions-tab.component';
import { CreateGroupComponent } from '@app/pages/questionnaire-item-page/create-group/create-group.component';
import { InvitationEmailsComponent } from '@app/pages/questionnaire-item-page/invitation-emails/invitation-emails.component';
import { AddTemplateComponent } from '@app/pages/questionnaire-item-page/add-template/add-template.component';
import { SendEmailsFieldsetComponent } from '@app/pages/questionnaire-item-page/send-emails-fieldset/send-emails-fieldset.component';

import { SelectKeyToMoveComponent } from '@app/components/dialog/select-key-to-move/select-key-to-move.component';

import { QuestionsComponent } from '@app/pages/questions/questions.component';
import { QuestionModalComponent } from '@app/pages/questions/question-modal/question-modal.component';
import { TitleCellRendererComponent } from '@app/pages/questions/title-cell-renderer/title-cell-renderer.component';
import { TypeCellRendererComponent } from '@app/pages/questions/type-cell-renderer/type-cell-renderer.component';
import { BelongsCellRendererComponent } from '@app/pages/questions/belongs-cell-renderer/belongs-cell-renderer.component';
import { GraphTypeCellRendererComponent } from '@app/pages/questions/graph-type-cell-renderer/graph-type-cell-renderer.component';
import { LabelSetEditorDialogComponent } from '@app/pages/questions/label-set-editor-dialog/label-set-editor-dialog.component';

import { ReportsCellRendererComponent } from '@app/pages/keys/reports-cell-renderer/reports-cell-renderer.component';
import {
  ReportsModalDialogComponent
} from '@app/components/dialog/reports-modal-dialog/reports-modal-dialog.component';
import { ReportsService } from '@app/_reports/services/reports.service';
import { RenameReportDialogComponent } from '@app/components/dialog/rename-report-dialog/rename-report-dialog.component';

import { MenuItemComponent } from '@app/components/menu-item/menu-item.component';


@NgModule({
  imports: [
    MatMenuModule,
    ClipboardModule,
    SharedModule,
    AdminRoutingModule,
    AgGridModule.withComponents([
      TitleCellRendererComponent,
      TypeCellRendererComponent,
      GraphTypeCellRendererComponent,
      BelongsCellRendererComponent,
      StatusRendererComponent,
      EmailCellRendererComponent,
      DateCellRendererComponent,
      NameCellRendererComponent,
      SelectAllRendererComponent,
      ReportsCellRendererComponent]),
    AngularDraggableModule
  ],
  declarations: [
    SidebarComponent,
    SbProfilesComponent,
    LogInComponent,
    AdminComponent,
    /** Participants */
    ParticipantsComponent,
    StatusRendererComponent,
    SelectAllRendererComponent,
    AddParticipantDialogComponent,
    UpdateFieldsComponent,
    ChangeStatusComponent,
    DeleteAttemptComponent,

    ImportParticipantsComponent,
    EmailCellRendererComponent,
    DateCellRendererComponent,
    NameCellRendererComponent,
    GridComponent,
    ResultDialogComponent,

    WelcomeComponent,
    UserAdministrationComponent,
    KeysComponent,
    KeysModalComponent,
    TitleCellRendererComponent,
    TypeCellRendererComponent,
    GraphTypeCellRendererComponent,
    BelongsCellRendererComponent,
    LabelSetEditorDialogComponent,
    ReportsModalDialogComponent,
    RenameReportDialogComponent,
    ReportsCellRendererComponent,
    ConfigurationComponent,
    ConfigurationFieldComponent,
    TrainingCoursesComponent,
    TrainingCourseModalComponent,
    QuestionnairePageComponent,
    QuestionsComponent,
    QuestionModalComponent,
    QuestionnaireAddPageComponent,
    QuestionnaireItemPageComponent,
    IncompleteAttemptsComponent,
    QuestionsTabComponent,
    CreateGroupComponent,
    InvitationEmailsComponent,
    AddTemplateComponent,
    SendEmailsFieldsetComponent,
    SelectKeyToMoveComponent,
    PreviewDialogComponent,
    MenuItemComponent
  ],
  providers: [
    AuthGuardService,
    AdminService,
    KeysService,
    TooltipService,
    ValidationService,
    TrainingCourseService,
    ModalPositionCacheService,
    ShowDialogService,
    ReportsService
  ],
  entryComponents: [
    KeysModalComponent,
    QuestionModalComponent,
    LabelSetEditorDialogComponent,
    SelectKeyToMoveComponent,
    ReportsModalDialogComponent,
    /** Participants */
    AddParticipantDialogComponent,
    UpdateFieldsComponent,
    ChangeStatusComponent,
    DeleteAttemptComponent,
    TrainingCourseModalComponent,
    CreateGroupComponent,
    AddTemplateComponent,
    PreviewDialogComponent,
    ReportsCellRendererComponent,
    RenameReportDialogComponent,

    ResultDialogComponent
  ]
})
export class AdminModule {

}
