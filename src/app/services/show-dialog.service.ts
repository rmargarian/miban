import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ConfirmationDialogComponent } from '@app/components/dialog/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ShowDialogService {

  constructor(
    private dialog: MatDialog) { }

  openConfirmationDialog(text: string, title: string): MatDialogRef<any> {
    return this.dialog.open(ConfirmationDialogComponent, <any>{
      width: '500px',
      data: {
        title: title,
        text: text
      }
    });
  }
}
