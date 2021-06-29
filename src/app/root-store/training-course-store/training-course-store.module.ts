import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { featureReducer } from './reducer';
import { TrainingCoursesEffects } from './effects';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('training-course', featureReducer),
    EffectsModule.forFeature([TrainingCoursesEffects])
  ]
})
export class TrainingCourseStoreModule { }
