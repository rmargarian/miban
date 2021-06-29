import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedEffects } from './effects';
import { featureReducer } from './reducer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('shared', featureReducer),
    EffectsModule.forFeature([SharedEffects])
  ]
})

/**
 * Module store CareerCategory, Country, Currency, State lists
 */
export class SharedStoreModule {}
