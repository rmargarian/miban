import { FormControl, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';

export class ArrayControl {
  constructor(options: any[], optionsAnswers: any[], validators?: ValidatorFn | ValidatorFn[]) {
    const groupObject = {};

    options.forEach(option => {
      const answer = optionsAnswers.find(a => a.question_answer_options_id === option.id);
      groupObject[option.id] = new FormControl(answer ? answer.label_set_options_id : undefined);
    });

    return new FormGroup(groupObject, validators);
  }
}

export function ArrayTypeRequiredValidator(c: AbstractControl) {

  for (const k in c.value) {
    if (c.value.hasOwnProperty(k) && !c.value[k]) {
      return {
        allOptions: true
      };
    }
  }

  return null;
}
