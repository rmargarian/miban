import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LogInComponent } from '@app/pages/log-in/log-in.component';
import { AdminComponent } from '@app/pages/admin/admin.component';
import { ParticipantsComponent } from '@app/pages/participants/participants.component';
import { UserAdministrationComponent } from '@app/pages/user-administration/user-administration.component';
import { WelcomeComponent } from '@app/pages/welcome/welcome.component';
import { KeysComponent } from '@app/pages/keys/keys.component';
import { ConfigurationComponent } from '@app/pages/configuration/configuration.component';
import { TrainingCoursesComponent } from '@app/pages/training-courses/training-courses.component';
import { QuestionnairePageComponent } from '@app/pages/questionnaire/questionnaire.component';
import { QuestionnaireAddPageComponent } from '@app/pages/questionnaire-add-page/questionnaire-add-page.component';
import { QuestionnaireItemPageComponent } from '@app/pages/questionnaire-item-page/questionnaire-item-page.component';
import { QuestionsComponent } from '@app/pages/questions/questions.component';
import { ImportParticipantsComponent } from '@app/pages/import-participants/import-participants.component';

import { AuthGuardService } from '@app/services/auth-guard.service';
import { RoutesEnum } from '@app/enums';

const routes: Routes = [
  {path: RoutesEnum.LOGIN, component: LogInComponent},
  {
    path: '', component: AdminComponent, pathMatch: 'prefix',
    children: [
      {path: '', redirectTo: RoutesEnum.WELCOME, pathMatch: 'full'},
      {path: '', component: WelcomeComponent },
      {path: RoutesEnum.WELCOME, component: WelcomeComponent},
      {path: RoutesEnum.PARTICIPANTS, component: ParticipantsComponent},
      {path: RoutesEnum.PARTICIPANTS + '/:id', component: ParticipantsComponent},
      {path: RoutesEnum.USER_ADMIN, component: UserAdministrationComponent},
      {path: RoutesEnum.KEYS, component: KeysComponent},
      {path: RoutesEnum.CONFIGURATION, component: ConfigurationComponent},
      {path: RoutesEnum.TRAINING_COURSES, component: TrainingCoursesComponent},
      // {path: RoutesEnum.REPORTS, component: ReportsComponent},
      {path: RoutesEnum.PROFILES, component: QuestionnairePageComponent},
      {path: RoutesEnum.ASSESSMENTS, component: QuestionnairePageComponent},
      {path: RoutesEnum.FEEDBACK, component: QuestionnairePageComponent},
      {path: RoutesEnum.PROFILES + '/:id', component: QuestionnaireItemPageComponent},
      {path: RoutesEnum.ASSESSMENTS + '/:id', component: QuestionnaireItemPageComponent},
      {path: RoutesEnum.FEEDBACK + '/:id', component: QuestionnaireItemPageComponent},
      {path: RoutesEnum.PROFILES_ADD, component: QuestionnaireAddPageComponent},
      {path: RoutesEnum.ASSESSMENTS_ADD, component: QuestionnaireAddPageComponent},
      {path: RoutesEnum.FEEDBACK_ADD, component: QuestionnaireAddPageComponent},
      {path: RoutesEnum.QUESTIONS, component: QuestionsComponent},
      {path: RoutesEnum.IMPORT_PARTICIPANTS, component: ImportParticipantsComponent}
    ],
    canActivate: [AuthGuardService]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
