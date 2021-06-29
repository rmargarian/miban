import {AbstractControl} from '@angular/forms';
/*
export interface AnswerOption {
  order_pos: number;
  score?: number;
  hided?: boolean;
  title: string;
}
*/
export enum TypeContainerChoices {
  YourChoices,
  YourRanking
}

export function OrderTypeRequiredValidator(options) {
  return function (c: AbstractControl) {
    if (c.value.length === options.length) {
      return null;
    }

    return {order: true};
  };
}

