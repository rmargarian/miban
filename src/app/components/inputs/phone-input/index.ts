import { AbstractControl, ValidatorFn } from '@angular/forms';
import * as libphonenumber from 'google-libphonenumber';

export class PhoneValidator {

  static validCountryPhone = (countryControl: AbstractControl): ValidatorFn => {
    let subscribe = false;
    const validator: ValidatorFn = (phoneControl: AbstractControl) => {
      if (!subscribe) {
        subscribe = true;
        countryControl.valueChanges.subscribe((value) => {
          phoneControl.updateValueAndValidity();
        });
      }

      if (phoneControl.value !== '') {
        try {
          if (!countryControl.value) {
            return {
              countryCodeNotChosen: true
            };
          }

          const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
          const phoneNumber = '' + phoneControl.value + '';
          const region = countryControl.value;
          const pNumber = phoneUtil.parseAndKeepRawInput(phoneNumber, region);
          const isValidNumber = phoneUtil.isValidNumber(pNumber);

          if (isValidNumber) {
            return undefined;
          }
        } catch (e) {
          return {
            validCountryPhone: true
          };
        }

        return {
          validCountryPhone: true
        };
      } else {
        return undefined;
      }
    };
    return validator;
  }
}
