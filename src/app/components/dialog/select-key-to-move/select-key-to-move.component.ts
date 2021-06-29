import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '@app/components';

@Component({
  selector: 'app-select-key-to-move',
  templateUrl: './select-key-to-move.component.html',
  styleUrls: ['./select-key-to-move.component.scss']
})
export class SelectKeyToMoveComponent extends DialogComponent implements OnInit {

  header: string;
  keys: any[];

  ngOnInit() {
    if (!this.data) {
      return;
    }
    this.header = this.data.header;
    this.keys = JSON.parse(JSON.stringify(this.data.keys));
    this.removeCurrentCompany();

    this.form = this.formBuilder.group({
      'selectedCompany': []
    });
  }

  private removeCurrentCompany() {
    for (let i = 0; i < this.keys.length; i++) {
      if (this.keys[i].id === this.data.currentCompanyId) {
        this.keys.splice(i, 1);
        break;
      }
    }
  }

  move() {
    this.closeDialog(this.form.controls.selectedCompany.value);
  }
}
