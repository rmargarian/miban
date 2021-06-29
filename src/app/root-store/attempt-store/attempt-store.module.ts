import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AttemptStoreEffects } from './effects';
import { featureReducer } from './reducer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('attempt', featureReducer),
    EffectsModule.forFeature([AttemptStoreEffects])
  ]
})
export class AttemptStoreModule {}
