import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { featureReducer } from './reducer';
import { EffectsModule } from '@ngrx/effects';
import { KeysStoreEffects } from '@app/root-store/keys-store/effects';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('key', featureReducer),
    EffectsModule.forFeature([KeysStoreEffects])
  ]
})
export class KeysStoreModule {}
