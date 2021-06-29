import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '@app/components';

@Component({
  selector: 'app-final-dialog',
  templateUrl: './final-dialog.component.html',
  styleUrls: ['./final-dialog.component.scss']
})
export class FinalDialogComponent extends DialogComponent implements OnInit {

  href: string = '';
  //qName: string = '';

  ngOnInit() {
    this.href = this.data.href;
    //this.qName = this.data.qName;
  }
}
