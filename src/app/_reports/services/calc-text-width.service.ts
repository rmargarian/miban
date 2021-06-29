import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalcTextWidthService {
  private calculationElement: HTMLElement;

  constructor() {
    this.createCalculationElement();
  }

  /**
   * this function accepts string and returns it's width in Html element;
   * @param {string} text
   * @returns {number}s
   */
  public calcWidthText(text: string): number {
    this.calculationElement.innerText = text;
    return this.calculationElement.offsetWidth;
  }

  /**
   * this is a custom function which is sets style to element from styleObj, use before calcWidthText
   * @param styleObj
   */
  public setStyles(styleObj): void {
    for (const prop in styleObj) {
      if (styleObj.hasOwnProperty(prop)) {
        this.calculationElement.style[prop] = styleObj[prop];
      }
    }
  }

  /**
   * Drop new styles of the calculation element to defaults. Always use after setStyles and all calcWidthText calls
   */
  public dropStyles() {
    this.calculationElement.parentNode.removeChild(this.calculationElement);
    this.createCalculationElement();
  }


  /**
   * this function create calculation element (div)
   * adds element to document
   * set some base styles (display, position)
   */
  private createCalculationElement(): void {
    this.calculationElement = document.createElement('div');
    this.calculationElement.style.display = 'inline-block';
    this.calculationElement.style.position = 'fixed';
    this.calculationElement.style.left = '-10000px';
    document.querySelector('body').appendChild(this.calculationElement);
  }
}
