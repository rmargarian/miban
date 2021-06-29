import { TestBed, inject } from '@angular/core/testing';

import { QuestionGroupService } from './question-group.service';

describe('QuestionGroupService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuestionGroupService]
    });
  });

  it('should be created', inject([QuestionGroupService], (service: QuestionGroupService) => {
    expect(service).toBeTruthy();
  }));
});
