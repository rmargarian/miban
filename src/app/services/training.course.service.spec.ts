import { TestBed, inject } from '@angular/core/testing';
import {TrainingCourseService} from './training.course.service';

describe('Training.Course.ServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TrainingCourseService]
    });
  });

  it('should be created', inject([TrainingCourseService], (service: TrainingCourseService) => {
    expect(service).toBeTruthy();
  }));
});
