import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { IncompleteAttemptStoreEffects } from './effects';
import { featureReducer } from './reducer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('incomplete_attempt', featureReducer),
    EffectsModule.forFeature([IncompleteAttemptStoreEffects])
  ]
})
export class IncompleteAttemptStoreModule {}
