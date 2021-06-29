import {Component, OnInit} from '@angular/core';

import {DialogComponent} from '../dialog.component';

@Component({
  selector: 'app-information-dialog',
  templateUrl: './information-dialog.component.html',
  styleUrls: ['./information-dialog.component.scss']
})
export class InformationDialogComponent extends DialogComponent implements OnInit {
  title: String = '';
  text: String = '';
  noTimer: boolean = true;

  ngOnInit() {
    this.dialogRef.backdropClick().subscribe(_ => {
      if (!this.data.disableClose) {
        this.closeDialog();
      }
    });

    this.dialogRef.keydownEvents().subscribe((event: KeyboardEvent) => {
      if (event.keyCode === this.keyCodes.ESCAPE) {
        event.preventDefault();
        this.closeDialog();
      }
    });

    if (this.data) {
      this.title = this.data.title;
      this.text = this.data.text;
      this.noTimer = this.data.noTimer;
    }
    if (!this.noTimer) setTimeout(() => this.closeDialog(), this.data.time || 900);
  }
}
