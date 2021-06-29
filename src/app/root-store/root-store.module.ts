import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { UserStoreModule } from './user-store';
import { KeysStoreModule } from './keys-store';
import { UserAdminStoreModule } from './user-admin-store';
import { TrainingCourseStoreModule } from '@app/root-store/training-course-store';
import { RouteStoreModule } from './route-store';
import { QuestionnaireStoreModule } from './questionnaire-store';
import { QuestionStoreModule } from './question-store';
import { AttemptStoreModule } from './attempt-store';
import { ImportStoreModule } from './import-store';
import { IncompleteAttemptStoreModule } from './incomplete-attempt-store';
import { SharedStoreModule } from './shared-store';

@NgModule({
  imports: [
    CommonModule,
    UserStoreModule,
    UserAdminStoreModule,
    TrainingCourseStoreModule,
    RouteStoreModule,
    QuestionnaireStoreModule,
    KeysStoreModule,
    QuestionStoreModule,
    AttemptStoreModule,
    ImportStoreModule,
    IncompleteAttemptStoreModule,
    SharedStoreModule,
    StoreModule.forRoot({}, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true
      }
    }),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
    }),
  ],
  declarations: []
})
export class RootStoreModule {}
