import {Injectable, OnDestroy} from '@angular/core';
import {fromEvent, Subject, merge} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {default as Tooltip} from 'tooltip.js';
import {Placement} from 'popper.js';

declare var $: any;

@Injectable({
  providedIn: 'root',
})
export class TooltipService implements OnDestroy {
  private mouseEvent: MouseEvent;
  private el = document.getElementsByTagName('body');
  private mouseMoves$ = fromEvent(this.el, 'mousemove');
  private refreshTooltip$: Subject<MouseEvent> = new Subject();
  private destroySubject$: Subject<void> = new Subject();
  private tooltip: Tooltip;
  private destroying: string = '';
  private hideDelay: number = 0;
  private timerId: number;
  private previousTooltipTarget: HTMLElement;
  private previousTargetRect: ClientRect;

  constructor() {
  }

  init() {
    // Create a stream to redraw tooltip by mouse move logic or manually
    merge(this.refreshTooltip$, this.mouseMoves$)
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(this.tooltipRedrawer.bind(this));
    window.addEventListener('scroll', this.wasScrollEvent.bind(this), true);
  }

  /**
   * Public method that allows to refresh tooltip from component after some event
   */
  public refreshTooltip() {
    if (this.tooltip) {
      this.reset();
      this.refreshTooltip$.next(this.mouseEvent);
    }
  }

  /**
   * Check if we need to redraw tooltip
   * @param {MouseEvent} evt
   */
  private tooltipRedrawer(evt: MouseEvent) {
    this.mouseEvent = evt;
    const target = (<HTMLElement>evt.target);
    const tooltipTarget = this.findParentTooltipTarget(target);
    if (this.tooltip) {
      // if there was a tooltip and now it is out of the target destroy it
      if (this.previousTooltipTarget !== this.findParentTooltipTarget(target)) {
        this.destroying = (<any>this.tooltip).reference.innerHTML;
        this.destroyTooltip();
      }
    }
    // if there was no tooltip, check if target is a child of element with tooltip attribute, then create it
    if (tooltipTarget && this.previousTooltipTarget !== this.findParentTooltipTarget(target)) {
      if (this.tooltip) { this.reset(); }
      const tooltipTextAttr = tooltipTarget.dataset['tooltip'];
      const tooltipPosAttr = tooltipTarget.dataset['tooltipPosition'];
      const tooltipClassAttr = tooltipTarget.dataset['tooltipClass'];
      const tooltipPreventOverflow = tooltipTarget.dataset['tooltipPreventOverflow'];
      this.hideDelay = parseInt(tooltipTarget.dataset['tooltipDelay'], 10) || 0;

      this.createTooltip(tooltipTarget, tooltipPosAttr, tooltipTextAttr, tooltipClassAttr,
        tooltipPreventOverflow === 'true');
      }
  }

  /**
   * Callback for scroll event that destroys tooltip
   */
  private wasScrollEvent() {
    if (this.tooltip) {
      this.destroying = (<any>this.tooltip).reference.innerHTML;
      this.destroyTooltip();
    }
  }

  /**
   * Check if there is parent html element with data-tooltip attribute. Iterate up to 5 parents
   * @param {HTMLElement} target
   * @returns {HTMLElement}
   */
  private findParentTooltipTarget(target: HTMLElement): HTMLElement | undefined {
    let findCounter = 5;
    while (target && findCounter !== 0) {
      if (target.hasAttribute('data-tooltip')) {
        return target;
      } else {
        target = target.parentElement;
        findCounter--;
      }
    }
    return undefined;
  }

  /**
   * Create tooltip
   * @param {HTMLElement} target
   * @param {string} tooltipPosAttr
   * @param {string} tooltipTextAttr
   * @param {string} tooltipClassAttr
   */
  public createTooltip(target: HTMLElement,
    tooltipPosAttr: string = 'bottom',
    tooltipTextAttr: string,
    tooltipClassAttr: string = '',
    tooltipPreventOverflow: boolean = false)
  {
    this.previousTargetRect = target.getBoundingClientRect();
    this.previousTooltipTarget = target;

    const preventOverflow = tooltipPreventOverflow ? { boundariesElement: null } : {};

    this.tooltip = new Tooltip(target, {
      placement: (<Placement>tooltipPosAttr),
      html: true,
      delay: this.hideDelay,
      popperOptions: {
        //positionFixed: true,
        modifiers: {
          preventOverflow: preventOverflow
        }
      },
      title: tooltipTextAttr,
      template: `
      <div class="tooltip" role="tooltip">
        <div class="tooltip-arrow"></div>
        <div class="tooltip-inner ${tooltipClassAttr}"></div>
      </div>`
    });

    this.timerId = window.setTimeout(() => {
      this.tooltip.show();
    }, 400);
  }

  /**
   * Destroy tooltip
   */
  public destroyTooltip() {
    if (this.hideDelay) {
      setTimeout(() => {
        if (this.tooltip && this.destroying === (<any>this.tooltip).reference.innerHTML) {
          this.reset();
        }
      }, this.hideDelay);
    } else {
      this.reset();
    }  
  }

  public reset() {
    if (!this.tooltip) { return; }
    clearTimeout(this.timerId);
    this.tooltip.dispose();
    this.tooltip = undefined;
    this.previousTooltipTarget = undefined;
    this.previousTargetRect = undefined;
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }
}
