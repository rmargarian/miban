import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';

import { DialogComponent } from '../dialog.component';

@Component({
  selector: 'app-extend-dialog',
  templateUrl: './extend-dialog.component.html',
  styleUrls: ['./extend-dialog.component.scss']
})
export class ExtendDialogComponent extends DialogComponent implements OnInit {


  ngOnInit() {
    this.dialogRef.backdropClick().subscribe(_ => {

    });

    this.dialogRef.keydownEvents().subscribe((event: KeyboardEvent) => {
      if (event.keyCode === this.keyCodes.ESCAPE) {
        event.preventDefault();
        this.closeDialog();
      }
    });

    this.form = this.formBuilder.group({
      'password': ['', [Validators.required]]
    });

    setTimeout(() => this.closeDialog(), 5 * 60 * 1000);
  }

  confirm() {
    //this.showValidation = true;
    //if (this.form.invalid) { return; }

    this.closeDialog(true);
  }

}
