import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ImportStoreEffects } from './effects';
import { featureReducer } from './reducer';

/**
 * Module responsible for storing and broadcast 'Import Participants' page states
 */
@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('import', featureReducer),
    EffectsModule.forFeature([ImportStoreEffects])
  ]
})
export class ImportStoreModule {}
