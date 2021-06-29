import { Injectable, Type } from '@angular/core';
import { Position } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ModalPositionCacheService {
  private _cache = new Map<Type<any>, Position>();

  /**
   * Set modal position by modal type
   * @param {Type<any>} dialog
   * @param {Position} position
   */
  public set(dialog: Type<any>, position: Position) {
    this._cache.set(dialog, position);
  }

  /**
   * Get modal position by modal type
   * @param {Type<any>} dialog
   * @returns {Position}
   */
  public get(dialog: Type<any>): Position|null {
    return this._cache.get(dialog);
  }
}
