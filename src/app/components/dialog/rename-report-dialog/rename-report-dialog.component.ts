import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '@app/components';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-rename-report-dialog',
  templateUrl: './rename-report-dialog.component.html',
  styleUrls: ['./rename-report-dialog.component.scss']
})
export class RenameReportDialogComponent extends DialogComponent implements OnInit {


  ngOnInit() {

    this.form = this.formBuilder.group({
      'name': [this.data.name, Validators.required]
    });
  }

  confirm() {
    this.closeDialog(this.form.controls.name.value);
  }

}
