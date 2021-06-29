import { OptionColumnInputType } from '@app/enums';

export class OptionColumn {

  /**
   * To create new OptionColumn instances that Options Editor can work with
   * @param {OptionColumnInputType} inputType
   * @param {string} fieldName - To what field in data attach the column
   * @param {boolean} required - Whether check required validity for this column
   * @param {number} widthRatio - To set column width in comparison to others in proportion. Based on flex grow internally
   * @param {string} placeholder - Placeholder to show in column inputs
   * @param {(event, option, fieldName) => void} optionChangeHandler - Custom handler for change events. Can be passed for
   * unique validation cases
   */
  constructor(public inputType: OptionColumnInputType,
              public fieldName: string,
              public required: boolean = false,
              public widthRatio: number = 1,
              public placeholder?: string,
              public optionChangeHandler?: (event, option, fieldName) => void) {
  }
}

