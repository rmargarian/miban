import { FormControl, ValidatorFn, FormGroup, FormArray } from '@angular/forms';

export class MultiOptionsControl {
  constructor(options: any[], selectedValues: any[], valueField: string, validators?: ValidatorFn | ValidatorFn[]) {
    const groupObject = {};

    options.map(item => {
      groupObject[item[valueField]] = new FormControl(selectedValues.indexOf(item[valueField]) !== -1);
    });
    return new FormGroup(groupObject, validators);
  }
}

export function MultiOptionsTypeRequiredValidator(min: number) {
  const validator: ValidatorFn = (formArray: FormArray) => {
    let selectedCount = 0;
    for (const key in formArray.value) {
      if (formArray.value.hasOwnProperty(key) && formArray.value[key] && ++selectedCount >= min) {
        return null;
      }
    }

    if (selectedCount > 0) {
      return { requiredOptions: true };
    }
    return { oneOption: true };
  };

  return validator;
}
