import { TestBed, inject } from '@angular/core/testing';

import { ShowDialogService } from './show-dialog.service';

describe('ShowDialogService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShowDialogService]
    });
  });

  it('should be created', inject([ShowDialogService], (service: ShowDialogService) => {
    expect(service).toBeTruthy();
  }));
});
