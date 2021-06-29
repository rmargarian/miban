import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { OptionColumn } from '@app/components/options-editor/option-column';
import { QuestionType } from '@app/enums';

enum FaceTypes {
  HAPPY = 1,
  NEUTRAL = 2,
  SAD = 3,
  NONE = 0
}

enum FaceColors {
  HAPPY = '#03c504',
  NEUTRAL = '#f9ce01',
  SAD = '#e90004',
  NONE = '#e7eaed'
}

enum FaceIcons {
  HAPPY = 'fa-smile',
  NEUTRAL = 'fa-meh',
  SAD = 'fa-frown',
  NONE = ''
}

class IconOption {
  iconClass: string =  '';
  color: string = '';
  type: number = FaceTypes.NONE;
}

@Component({
  selector: 'app-options-multichoice-editor',
  templateUrl: './options-multichoice-editor.component.html',
  styleUrls: ['./options-multichoice-editor.component.scss']
})
export class OptionsMultiChoiceEditorComponent implements OnChanges, OnInit {

  @Input() header: string;
  @Input() orderFieldName: string = 'order_pos';
  @Input() questionType: number;
  @Input() disabled: boolean;
  @Input() showValidation: boolean = false;
  @Input() showFacesControl: FormControl;
  @Input() options: any[];
  @Input() optionsColumns: OptionColumn[];
  @Output() addOption: EventEmitter<any> = new EventEmitter();
  @Output() removeOption: EventEmitter<any> = new EventEmitter();
  @Output() changeOption: EventEmitter<any> = new EventEmitter();
  @Output() changeOrderPosition: EventEmitter<any[]> = new EventEmitter();
  @Output() validationEmitter: EventEmitter<boolean> = new EventEmitter();

  questionTypes = QuestionType;
  iconsOptions: IconOption[];
  faceTypes = FaceTypes;
  showFaces: boolean = false;
  rowsCount: number = 3;

  constructor() {
    this.iconsOptions = [
      {iconClass: FaceIcons.HAPPY, type: FaceTypes.HAPPY, color: FaceColors.HAPPY},
      {iconClass: FaceIcons.NEUTRAL, type: FaceTypes.NEUTRAL, color: FaceColors.NEUTRAL},
      {iconClass: FaceIcons.SAD, type: FaceTypes.SAD, color: FaceColors.SAD},
      {iconClass: FaceIcons.NONE, type: FaceTypes.NONE, color: FaceColors.NONE}
    ];
  }

  ngOnInit() {
    this.showFaces = this.showFacesControl.value;
    this.showFacesControl.valueChanges
    .subscribe(value => {
      this.showFaces = value;
    });

    if (this.questionType === QuestionType.MULTIPLE_CHOISE_SINGLE_OPTION) {
      //this.rowsCount = 2;
    }
  }

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
   * @returns {any}
   */
  optionChanged() {
    this.changeOption.emit();
    this.checkValidation(this.optionsColumns, this.options);
  }

  onFaceSelected() {
    this.changeOption.emit();
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
}
