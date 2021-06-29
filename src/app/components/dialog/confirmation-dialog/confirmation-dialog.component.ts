import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '../dialog.component';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent extends DialogComponent implements OnInit {
  title: String = 'Confirmation Delete';
  text: String = '';
  okText: string = 'Yes';
  cancelText: string = 'No';

  ngOnInit() {
    if (this.data) {
      if (this.data.title) { this.title = this.data.title; }
      if (this.data.okText) { this.okText = this.data.okText; }
      if (this.data.cancelText) { this.cancelText = this.data.cancelText; }
      this.text = this.data.text;
    }
  }
  confirm() {
    this.closeDialog('confirm');
  }

}
