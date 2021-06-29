import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { TooltipService } from '@app/services/tooltip.service';
import { nameRegex, emailRegex } from '@app/contants';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnChanges, AfterViewInit {
  @ViewChild('input', { static: false }) inputElement: ElementRef;
  @Input() type: string = 'text';
  @Input() maxlength: number;
  @Input() min: number = 1;
  @Input() readonly: boolean = false;
  @Input() placeholder: string;
  @Input() tooltipText: string;
  @Input() tooltipPosition: string = 'bottom-start';
  @Input() tooltipPreventOverflow: boolean = false;
  @Input() control: AbstractControl;
  @Input() validationErrors: ValidationErrors;
  @Input() focus: boolean = false;
  @Input() showValidation: boolean = false;
  @Input() showValidationTriggered: boolean = false;
  @Input() notTooltip: boolean = false;
  @Input() isAttemptPage: boolean = false;
  @Input() isValidationByFocusOut: boolean = false;

  errorMessage: string;
  focused: boolean = false;

  constructor(public tooltipService: TooltipService) {
  }

  ngAfterViewInit() {
    if (!this.isValidationByFocusOut) {
      setTimeout(() => {
        this.showValidationTriggered = true;
      });
    }
    if (this.focus) {
      setTimeout(() => {
        (<any>this.inputElement.nativeElement).focus();
      });
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (typeof changes.validationErrors !== 'undefined' &&
      changes.validationErrors.currentValue !== changes.validationErrors.previousValue) {
      this.setErrorMessage(changes.validationErrors);
    }
  }

  /**
   * Show validation error message in tooltip on hover based on the type of the provided error
   * @param validationErrors
   */
  private setErrorMessage(validationErrors) {
    const error = validationErrors.currentValue;
    if (error && error.required) {
      this.errorMessage = 'This field is required';
      if (this.isAttemptPage) {
        this.errorMessage = 'Please respond';
      }
    } else if (error && error.pattern && error.pattern.requiredPattern === nameRegex.toString()) {
      this.errorMessage = 'Only [a-z, A-Z, -\' and space] are allowed';
    } else if (error && error.pattern && error.pattern.requiredPattern === emailRegex.toString()) {
      this.setEmailErrorMsg(error.pattern.actualValue);
      //this.errorMessage = 'This email is invalid. Sorry, only letters (a-z), numbers (0-9), and periods (._) are allowed.';
    } else if (error && error.emailTaken) {
      this.errorMessage = 'This email already exists';
    } else if (error && error.invalidPasswd) {
      this.errorMessage = 'Wrong password. Try again or click Password Reminder.';
    }

    else if (error && error.max25) {
      this.errorMessage = 'Use 25 characters or fewer.';
    } else if (error && error.max35) {
      this.errorMessage = 'Use 35 characters or fewer.';
    } else if (error && error.max70) {
      this.errorMessage = 'Use 70 characters or fewer.';
    }

    else if (error && error.attemptTaken) {
      this.errorMessage = 'The visitor with such email already completed this Assessment.';
    } else if (error && error.validCountryPhone) {
      this.errorMessage = 'Phone incorrect for the country selected';
    } else if (error && error.countryCodeNotChosen) {
      this.errorMessage = 'Please select country phone code';
    } else if (error && error.questionTitleTaken) {
      this.errorMessage = 'This question already exists. Please create a different question.';
    } else if (error && error.questionnaireAcronymTaken) {
      this.errorMessage = `The acronym '${error.value}' already exists, please choose another acronym.`;
    } else if (error && error.userNameTaken) {
      this.errorMessage = 'This username already exists';
    } else if (error && error.companyKeyTaken) {
      this.errorMessage = 'This Key already exists';
    } else if (error && error.companyTitleTaken) {
      this.errorMessage = 'This Key Description already exists';
    } else if (error && error.trainingCourseNameTaken) {
      this.errorMessage = 'This training course name already exists';
    } else if (error && error.minlength) {
      this.errorMessage = 'Min ' + error.minlength.requiredLength + ' characters required';
    } else if (error && error.passwordsMismatch) {
      this.errorMessage = 'Confirm password doesn\'t match';
    } else if (error && error.min) {
      this.errorMessage = 'Must be a natural number';
    } else if (error && error.notAllowedEmail) {
      this.errorMessage = 'Email address is not in the allowed list';
    } else if (error && error.invalid_emails) {
      this.errorMessage = 'Invalid Email(s) or Wrong separators';
    } else if (error && error.templateTaken) {
      this.errorMessage = 'Please create a unique description';
    } else if (error && error.maxRange) {
      this.errorMessage = 'Min options cannot >  Max options';
    } else if (error && error.minRange) {
      this.errorMessage = 'Min options cannot >  Max options';
    } else {
      this.errorMessage = undefined;
    }
    if (!validationErrors.isFirstChange()) {
      setTimeout(() => {
        this.tooltipService.refreshTooltip();
      });
    }
  }

  private setEmailErrorMsg(value: string) {
    this.errorMessage = 'This email address is not valid';
    if (value.indexOf('@') === -1) {
      this.errorMessage = `Don't forget to include the '@'`;
    } else if ((value.split('@').length - 1) > 1) {
      this.errorMessage = `Enter an email address with only one '@'`;
    } else if (value.slice(-1) === '@') {
      this.errorMessage = `Enter a domain name after the '@'`;
    }
  }

  public onFocusOut($event: FocusEvent) {
    if ((<HTMLInputElement>$event.target).value) {
      this.showValidationTriggered = true;
    }
    this.focused = false;
  }

  public onFocusIn($event: FocusEvent) {
    this.focused = true;
  }
}
