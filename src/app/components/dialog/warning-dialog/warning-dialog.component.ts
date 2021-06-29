import { Component, OnInit } from '@angular/core';

import { DialogComponent } from '../dialog.component';

@Component({
  selector: 'app-warning-dialog',
  templateUrl: './warning-dialog.component.html',
  styleUrls: ['./warning-dialog.component.scss']
})
export class WarningDialogComponent extends DialogComponent implements OnInit {
  title: String = '';
  text: String = '';

  ngOnInit() {
    if(this.data) {
      this.title = this.data.title;
      this.text = this.data.text;
    }
  }

}
