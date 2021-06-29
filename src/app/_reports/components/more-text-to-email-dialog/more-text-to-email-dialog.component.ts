import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '../../../components/dialog';

@Component({
  selector: 'app-more-text-to-email-dialog',
  templateUrl: './more-text-to-email-dialog.component.html',
  styleUrls: ['./more-text-to-email-dialog.component.scss']
})
export class MoreTextToEmailDialogComponent extends DialogComponent implements OnInit {

  title: string;
  text: string;

  ngOnInit() {
    if (this.data) {
      this.title = this.data.title;
      this.text = this.data.text;
    }
    this.form = this.formBuilder.group({
      'text': [this.text]
    });
  }
}
