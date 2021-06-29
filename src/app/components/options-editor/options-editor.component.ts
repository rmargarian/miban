import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { OptionColumn } from '@app/components/options-editor/option-column';

@Component({
  selector: 'app-answer-options-editor',
  templateUrl: './options-editor.component.html',
  styleUrls: ['./options-editor.component.scss']
})
export class OptionsEditorComponent implements OnChanges {

  @Input() header: string;
  @Input() rowsCount: number = 2;
  @Input() orderFieldName: string = 'order_pos';
  @Input() disabled: boolean;
  @Input() showValidation: boolean = false;
  @Input() options: any[];
  @Input() optionsColumns: OptionColumn[];
  @Output() addOption: EventEmitter<any> = new EventEmitter();
  @Output() removeOption: EventEmitter<any> = new EventEmitter();
  @Output() changeOption: EventEmitter<any> = new EventEmitter();
  @Output() changeOrderPosition: EventEmitter<any[]> = new EventEmitter();
  @Output() validationEmitter: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.options && !changes.options.currentValue) {
      this.options = [];
    }
    if (changes.options && changes.options.currentValue && this.optionsColumns) {
      this.checkValidation(this.optionsColumns, changes.options.currentValue);
    } else if (changes.optionsColumns && changes.optionsColumns.currentValue && this.options) {
      this.checkValidation(changes.optionsColumns.currentValue, this.options);
    }
  }

  onAddOption() {
    const field = this.orderFieldName;
    const newOption = {
      [field]: this.getNextIndex()
    };
    this.addOption.emit(newOption);
  }

  onRemoveOption(answer_option) {
    this.removeOption.emit(answer_option);
  }

  onChangeOrderPosition(options) {
    this.changeOrderPosition.emit(options);
  }

  /**
   * Trigger checkValidation by default or custom optionChangeHandler that can be passed in OptionColumn definition
   * @param value
   * @param option
   * @param fieldName
   * @param optionChangeHandler
   * @returns {any}
   */
  optionChanged(value, option, fieldName, optionChangeHandler) {
    if (optionChangeHandler) {
      return optionChangeHandler(value, option, fieldName);
    }

    option[fieldName] = value;
    this.changeOption.emit();
    this.checkValidation(this.optionsColumns, this.options);
  }

  /**
   * Check if options are valid on option change. Currently only by required field validation is hardcoded
   * @param {any[]} optionsColumns
   * @param {any[]} options
   */
  checkValidation(optionsColumns: any[], options: any[]) {
    if (optionsColumns) {
      for (let i = 0; i < optionsColumns.length; i++) {
        const column = optionsColumns[i];
        if (column.required) {
          for (let j = 0; j < options.length; j++) {
            if (this.isOptionFieldEmpty(options[j], column)) {
              this.validationEmitter.emit(false);
              return;
            }
          }
        }
      }
    }
    this.validationEmitter.emit(true);
  }

  checkErrorTooltipMessage(option, column: OptionColumn): string {
    return (column.required && this.isOptionFieldEmpty(option, column) && this.showValidation) ? 'This field is required' : '';
  }

  /**
   * Check if option field is empty by field name
   * @param option
   * @param {OptionColumn} column
   * @returns {boolean}
   */
  private isOptionFieldEmpty(option, column: OptionColumn): boolean {
    return option[column['fieldName']] === undefined || option[column['fieldName']] === '';
  }

  private getNextIndex(): number {
    return this.options ? this.options.length : 0;
  }
}
