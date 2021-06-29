import {
  Component,
  AfterViewInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/index';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss']
})
export class SearchInputComponent implements AfterViewInit, OnDestroy {
  @ViewChild('input', { static: false }) inputElement: ElementRef;
  @Input() debounceTime: number = 0;
  @Input() filterFormControl = new FormControl();
  @Input() focus: boolean = false;
  @Output() changes: EventEmitter<string> = new EventEmitter();
  @Output() clear: EventEmitter<string> = new EventEmitter();
  private filterFormControlSub: Subscription;

  constructor() {
  }

  ngAfterViewInit() {
    if (this.focus) {
      (<any>this.inputElement.nativeElement).focus();
    }
    this.subscribeFilter();
  }

  ngOnDestroy() {
    this.unsubscribeFilter();
  }

  clearFilter() {
    this.clearFilterValue();
    this.clear.emit('');
    this.applyFilterSearch('');
  }

  clearFilterValue() {
    this.unsubscribeFilter();
    this.filterFormControl.setValue('');
    this.subscribeFilter();
  }

  private applyFilterSearch(value: string) {
    this.changes.emit(value);
  }

  /**
   * Emit filtering event with a debounce for better performance of the requests on backend
   */
  private subscribeFilter() {
    this.filterFormControlSub = this.filterFormControl.valueChanges
      .pipe(debounceTime(this.debounceTime))
      .subscribe(this.applyFilterSearch.bind(this));
  }

  private unsubscribeFilter() {
    if (this.filterFormControlSub) {
      this.filterFormControlSub.unsubscribe();
    }
  }
}
