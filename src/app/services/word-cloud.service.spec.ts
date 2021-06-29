import { TestBed, inject } from '@angular/core/testing';

import { WordCloudService } from './word-cloud.service';

describe('WordCloudService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WordCloudService]
    });
  });

  it('should be created', inject([WordCloudService], (service: WordCloudService) => {
    expect(service).toBeTruthy();
  }));
});
