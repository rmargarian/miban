import {
  Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, AfterViewInit
} from '@angular/core';
import { InputComponent } from '../input.component';
import { StrengthPasswordComponent } from '../strength-password/strength-password.component';
import { debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import Popper from 'popper.js';

@Component({
  selector: 'app-password-input',
  templateUrl: './password.input.component.html',
  styleUrls: ['./password.input.component.scss', '../input.component.scss']
})
export class PasswordInputComponent extends InputComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() type: string = 'password';
  @Input() showStrengthPass: boolean = true;
  @ViewChild('inputElement', { static: false }) inputElement: ElementRef;
  @ViewChild('passwordHintComponent', { static: false }) passwordHintComponent: StrengthPasswordComponent;

  originPasswordHintElement: HTMLElement;
  private subscription: Subscription;
  popper: Popper;
  passwordTypeToggler: boolean = false;
  private userInteraction: boolean = false;
  eye_icon: string = 'visibility_off';

  ngOnInit() {
    this.subscription = this.control.valueChanges.pipe(debounceTime(50)).subscribe(change => {
      if (this.popper) {
        this.popper.update();
      }
    });
  }

  ngAfterViewInit() {
    if (this.showStrengthPass) {
      this.originPasswordHintElement = this.passwordHintComponent.elementRef.nativeElement;
      this.popper = new Popper(this.inputElement.nativeElement, this.originPasswordHintElement, {
        positionFixed: true,
        placement: 'bottom-start',
        modifiers: {
          preventOverflow: {
            boundariesElement: null,
          },
        },
      });
      this.originPasswordHintElement.style.display = 'none';
    }

    // we need to check actual user interaction to prevent browser focus
    const mouseDownCallback = () => {
      this.userInteraction = true;
      this.inputElement.nativeElement.removeEventListener('mousedown', mouseDownCallback);
    };

    this.inputElement.nativeElement.addEventListener('mousedown', mouseDownCallback);
  }

  focusOn() {
    if (this.showStrengthPass && this.userInteraction) {
      this.showTooltip();
    }
  }

  focusOut() {
    if (this.showStrengthPass && this.userInteraction) {
      this.hideTooltip();
    }
  }

  public passwordToogle(inputElement: HTMLInputElement) {
    if (inputElement.value) {
      this.passwordTypeToggler = !this.passwordTypeToggler;
      if (this.passwordTypeToggler) {
        inputElement.type = 'text';
        this.eye_icon = 'visibility';
      } else {
        inputElement.type = 'password';
        this.eye_icon = 'visibility_off';
      }
    }
  }

  private showTooltip() {
    this.originPasswordHintElement.style.display = 'block';
    this.popper.update();
    this.originPasswordHintElement.style.visibility = 'visible';
  }

  private hideTooltip() {
    this.originPasswordHintElement.style.display = 'none';
    this.originPasswordHintElement.style.visibility = 'hidden';
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.popper) {
      this.popper.destroy();
    }
  }
}
