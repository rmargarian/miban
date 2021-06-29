import { Injectable } from '@angular/core';

import { AttemptData } from '../models';

@Injectable()
export class SessionStorageService {
  constructor() { }

  public saveState(state: AttemptData): void {
    sessionStorage.setItem('pfa-attempt', JSON.stringify(state));
  }

  public getState(): AttemptData {
    const state = sessionStorage.getItem('pfa-attempt');
    return state ? JSON.parse(state) : null;
  }

  public resetState(): void {
    sessionStorage.setItem('pfa-attempt', null);
  }
}
