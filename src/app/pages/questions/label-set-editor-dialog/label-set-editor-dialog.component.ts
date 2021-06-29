import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '@app/components';
import { Validators } from '@angular/forms';
import { OptionColumn } from '@app/components/options-editor/option-column';
import { OptionColumnInputType } from '@app/enums';

@Component({
  selector: 'app-label-set-editor-dialog',
  templateUrl: './label-set-editor-dialog.component.html',
  styleUrls: ['./label-set-editor-dialog.component.scss']
})
export class LabelSetEditorDialogComponent extends DialogComponent implements OnInit {

  header: string;
  optionColumns: OptionColumn[];
  labelsInfo: any[];
  labelSetValidator: boolean;

  ngOnInit() {
    this.header = this.data.header;

    if (this.data.type === 'edit') {
      if (!this.data.labelsInfo) {
        this.labelsInfo = [];
      } else {
        this.labelsInfo = JSON.parse(JSON.stringify(this.data.labelsInfo));
      }

      this.setupEditor();
    } else if (this.data.type === 'add') {
      this.labelsInfo = [];
    }

    this.setupEditor();

    this.form = this.formBuilder.group({
      'title': [this.data.title ? this.data.title : '', Validators.required]
    });
  }

  private setupEditor() {
    this.optionColumns = [new OptionColumn(OptionColumnInputType.TEXT, 'value', true)];
  }

  addOption(newOption) {
    newOption.value = '';
    newOption.order_pos = this.labelsInfo.length;
    this.labelsInfo.push(newOption);
    this.labelSetValidator = false;
    this.labelsInfo = this.labelsInfo.slice();
  }

  removeOption(optionToDelete) {
    this.labelsInfo.splice(this.labelsInfo.indexOf(optionToDelete), 1);
    this.updateOrderPositions();
    this.labelsInfo = this.labelsInfo.slice();
  }

  changeValidation(value: boolean) {
    this.labelSetValidator = value;
  }

  private updateOrderPositions() {
    for (let i = 0; i < this.labelsInfo.length; i++) {
      this.labelsInfo[i].order_pos = i;
    }
  }

  changePosition(options) {
    for (let i = 0; i < options.length; i++) {
      options[i].order_pos = i;
    }
    this.labelsInfo = options;
  }

  save() {
    this.closeDialog({title: this.form.controls['title'].value, data: this.labelsInfo});
  }

}
