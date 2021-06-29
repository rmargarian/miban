import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { QuestionnaireStoreEffects } from './effects';
import { featureReducer } from './reducer';

/**
 * QuestionnaireStoreModule responsible for storing all Questionnaire states:
 * On left-side navbar (selected Questionnaire id: 'selectedId' in state.ts file)
 * and on Profile/Assessment/Feedback page (all another states in state.ts file).
 */
@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('questionnaire', featureReducer),
    EffectsModule.forFeature([QuestionnaireStoreEffects])
  ]
})
export class QuestionnaireStoreModule {}
