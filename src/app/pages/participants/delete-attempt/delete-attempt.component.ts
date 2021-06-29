import { Component, OnInit } from '@angular/core';

import { DialogComponent } from '@app/components';

@Component({
  selector: 'app-delete-attempt',
  templateUrl: './delete-attempt.component.html',
  styleUrls: ['./delete-attempt.component.scss']
})
export class DeleteAttemptComponent extends DialogComponent implements OnInit {

  attempts = [];
  ngOnInit() {
    this.data.attempts.forEach((element, index) => {
      this.attempts.push({id: element.id, value: index + 1});
    });
    this.form = this.formBuilder.group({
      'attempt': []
    });
  }

  save() {
    if (this.form.pristine) return;
    this.closeDialog(this.form.value);
  }
}
