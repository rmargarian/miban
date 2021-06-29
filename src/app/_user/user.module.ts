import { NgModule } from '@angular/core';
import {ProgressBarModule} from 'angular-progress-bar';

import { UserRoutingModule } from './user-routing.module';
import { SharedModule } from '@app/_shared/shared.module';

import { UserComponent } from '@app/_user/user.component';
import { RegisterPageComponent } from '@app/_user/pages/register-page/register-page.component';
import { EnterKeyComponent } from '@app/_user/pages/enter-key/enter-key.component';
import { HeaderComponent } from '@app/_user/components/header/header.component';
import { ChoosePFAComponent } from '@app/_user/pages/choose-pfa/choose-pfa.component';
import { EnterEmailComponent } from '@app/_user/pages/enter-email/enter-email.component';
import { RegisterFormComponent } from '@app/_user/pages/register-page/register-form/register-form.component';
import { ChangeKeyPageComponent } from '@app/_user/pages/change-key-page/change-key-page.component';
import { StartAttemptComponent } from '@app/_user/pages/start-attempt/start-attempt.component';
import { GroupPageComponent } from '@app/_user/pages/start-attempt/group-page/group-page.component';
import { StartFreeAttemptComponent } from '@app/_user/pages/start-free-attempt/start-free-attempt.component';
import { GroupPageFreeComponent } from '@app/_user/pages/start-free-attempt/group-page-free/group-page-free.component';
import { RegDialogComponent } from '@app/_user/pages/start-free-attempt/reg-dialog/reg-dialog.component';
import { FinalDialogComponent } from '@app/_user/pages/start-free-attempt/final-dialog/final-dialog.component';
import { ResultsPageComponent } from '@app/_user/pages/results-page/results-page.component';

import {
  SessionStorageService,
  FreeAttemptSessionStorageService,
  IncompleteAttemptService
} from '@app/_user/services';
import { HMSPipe } from './pipes/hms.pipe';

@NgModule({
  imports: [
    ProgressBarModule,
    SharedModule,
    UserRoutingModule
  ],
  declarations: [
    UserComponent,
    RegisterPageComponent,
    EnterKeyComponent,
    HeaderComponent,
    ChoosePFAComponent,
    EnterEmailComponent,
    RegisterFormComponent,
    ChangeKeyPageComponent,
    StartAttemptComponent,
    GroupPageComponent,
    StartFreeAttemptComponent,
    GroupPageFreeComponent,
    RegDialogComponent,
    FinalDialogComponent,
    ResultsPageComponent,
    HMSPipe
  ],
  providers: [
    SessionStorageService,
    FreeAttemptSessionStorageService,
    IncompleteAttemptService
  ],
  entryComponents: [
    RegDialogComponent,
    FinalDialogComponent
  ]
})
export class UserModule { }
