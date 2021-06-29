import { Directive, HostListener, AfterViewInit } from '@angular/core';
import { MatDialogContainer, MatDialogRef } from '@angular/material';
import { Subscription, Observable, fromEvent } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { ModalPositionCacheService } from '../services';
import { Position } from '../interfaces';

@Directive({
  selector: '[appMatDialogDraggableTitle]'
})
export class DialogDraggableTitleDirective implements AfterViewInit {

  private _subscription: Subscription;

  mouseStart: Position;

  mouseDelta: Position;

  offset: Position;

  constructor(
    private matDialogRef: MatDialogRef<any>,
    private container: MatDialogContainer,
    private positionCache: ModalPositionCacheService) {}

  ngAfterViewInit() {
    const dialogType = this.matDialogRef.componentInstance.constructor;
    const cachedValue = this.positionCache.get(dialogType);
    this.offset = cachedValue || this._getOffset();
    this._updatePosition(this.offset);

    this.matDialogRef.beforeClose().pipe(take(1))
      .subscribe(() => {
        this.positionCache.set(dialogType, this.offset);
      });
  }

  @HostListener('mousedown', ['$event'])
  /**
   * Setup events to drag modal
   * @param {MouseEvent} event
   */
  onMouseDown(event: MouseEvent) {
    this.mouseStart = {x: event.pageX, y: event.pageY};

    const mouseup$ = fromEvent(document, 'mouseup');

    this._subscription = mouseup$.subscribe((e: MouseEvent) => this.onMouseup(e));

    const mousemove$ = fromEvent(document, 'mousemove')
      .pipe(takeUntil(mouseup$))
      .subscribe((e: MouseEvent) => this.onMouseMove(e));

    this._subscription.add(mousemove$);
  }

  /**
   * Calculate new modal position from mouse coordinates
   * @param {MouseEvent} event
   */
  onMouseMove(event: MouseEvent) {
    this.mouseDelta = {x: (event.pageX - this.mouseStart.x), y: (event.pageY - this.mouseStart.y)};

    const offset = {x: this.offset.x + this.mouseDelta.x, y: this.offset.y + this.mouseDelta.y};

    if (event.currentTarget) {
      this.getAndSetOffset(offset, (<any>event.currentTarget).activeElement);
    }
    this._updatePosition(offset);
  }

  /**
   * Finish dragging
   */
  onMouseup(event: MouseEvent) {
    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = undefined;
    }
    if (this.mouseDelta) {
      this.offset.x += this.mouseDelta.x;
      this.offset.y += this.mouseDelta.y;
    }
    if (event.currentTarget) {
      this.getAndSetOffset(this.offset, (<any>event.currentTarget).activeElement);
    }
  }

  /**
   * Modal dialog window position setter
   * @param {number} top
   * @param {number} left
   * @private
   */
  private _updatePosition(offset: Position) {
    this.matDialogRef.updatePosition({
      left: offset.x + 'px',
      top: offset.y + 'px'
    });
  }

  /**
   * Checks and updates offset coordinates if element was dragged under the Client rect.
   * @param offset (Position)
   * @param activeElement
   */
  private getAndSetOffset(offset: Position, activeElement: any) {
    if (offset.x < 0) {
      offset.x = 0;
    } else if (offset.x > window.innerWidth - activeElement.clientWidth) {
      offset.x = window.innerWidth - activeElement.clientWidth;
    }

    if (offset.y < 0) {
      offset.y = 0;
    } else if (offset.y > window.innerHeight - activeElement.clientHeight) {
      offset.y = window.innerHeight - activeElement.clientHeight;
    }
  }

  /**
   * Get default offset for modal
   * @returns {Position}
   * @private
   */
  private _getOffset(): Position {
    const box = this.container['_elementRef'].nativeElement.getBoundingClientRect();
    return {
      x: box.left + pageXOffset,
      y: box.top + pageYOffset
    };
  }
}
