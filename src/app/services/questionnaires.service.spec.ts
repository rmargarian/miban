import { TestBed, inject } from '@angular/core/testing';

import { QuestionnairesService } from './questionnaires.service';

describe('QuestionnairesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuestionnairesService]
    });
  });

  it('should be created', inject([QuestionnairesService], (service: QuestionnairesService) => {
    expect(service).toBeTruthy();
  }));
});
