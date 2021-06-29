import { Injectable } from '@angular/core';

import { FreeAttemptData } from '../models';
import { Attempt, User, UserAnswer, UserAnswerOption, IncompleteAttempt } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class FreeAttemptSessionStorageService {
  private data: FreeAttemptData;

  constructor() {
    const state = sessionStorage.getItem('pfa-free-attempt');
    this.data = state ? JSON.parse(state) : null;

    if (!this.data) {
      this.data = {} as FreeAttemptData;
      this.data.currPage = 1;
      this.data.YPos = 0;
      this.data.attempt = {} as Attempt;
      this.data.user = {} as User;
      this.data.attempt.answers = [];
      this.data.attempt.passed_time = 0;
      this.saveState(this.data);
    }
  }

  public saveState(state: FreeAttemptData): void {
    this.data = state;
    sessionStorage.setItem('pfa-free-attempt', JSON.stringify(this.data));
  }

  public getState(): FreeAttemptData {
    return this.data;
  }

  public getAnswersCount() {
    return this.data.attempt.answers.length;
  }

  public resetState(): void {
    this.data = null;
    sessionStorage.setItem('pfa-free-attempt', null);
  }

  public setIsFinished(isFinished: boolean) {
    this.data.isFinished = isFinished;
    sessionStorage.setItem('pfa-free-attempt', JSON.stringify(this.data));
  }

  public setqYPos(YPos: number) {
    this.data.YPos = YPos;
    sessionStorage.setItem('pfa-free-attempt', JSON.stringify(this.data));
  }

  public setCurrPage(currPage: number) {
    this.data.currPage = currPage;
    sessionStorage.setItem('pfa-free-attempt', JSON.stringify(this.data));
  }

  public setPassedTime(secs: number) {
    this.data.attempt.passed_time = secs;
    sessionStorage.setItem('pfa-free-attempt', JSON.stringify(this.data));
  }

  public setIncompleteAttempt(att: IncompleteAttempt) {
    this.data.incompleteAttempt = att;
    sessionStorage.setItem('pfa-free-attempt', JSON.stringify(this.data));
  }

  public findOrcreateUserAnswer(answer: UserAnswer): UserAnswer {
    for (const answ of this.data.attempt.answers) {
      if (answ.question_id === answer.question_id) {
        return answ;
      }
    }
    this.data.attempt.answers.push(answer);
    sessionStorage.setItem('pfa-free-attempt', JSON.stringify(this.data));
    return answer;
  }

  public updateUserAnswer(answer: UserAnswer) {
    for (const answ of this.data.attempt.answers) {
      if (answ.question_id === answer.question_id) {
        answ.comment = answer.comment ? answer.comment : answ.comment;
        sessionStorage.setItem('pfa-free-attempt', JSON.stringify(this.data));
        break;
      }
    }
  }

  public createOrUpdateUserAnswerOptions(options: UserAnswerOption[], question_id: number) {
    for (const answ of this.data.attempt.answers) {
      if (answ.question_id === question_id) {
        answ.answer_options = options;
        sessionStorage.setItem('pfa-free-attempt', JSON.stringify(this.data));
        break;
      }
    }
  }

  public setPhoneCountry(code: string, iso: string) {
    this.data.user.phone_code = code;
    this.data.user.phone_iso2 = iso;
    sessionStorage.setItem('pfa-free-attempt', JSON.stringify(this.data));
  }

  public setUserInfo(user: User) {
    this.data.user = user;
    sessionStorage.setItem('pfa-free-attempt', JSON.stringify(this.data));
  }
}
