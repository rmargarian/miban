import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-belongs-cell-renderer',
  templateUrl: './belongs-cell-renderer.component.html',
  styleUrls: ['./belongs-cell-renderer.component.scss']
})
export class BelongsCellRendererComponent implements OnInit {

  belongsType: number;
  textByType: string;

  constructor() {
  }

  ngOnInit() {
  }

  agInit(params: any): void {
    this.belongsType = params.data.quest_type;
    this.setTextByType(this.belongsType);
  }

  setTextByType(type: number) {
    switch (type) {
      case 1: this.textByType = 'Assessments'; break;
      case 2: this.textByType = 'Profiles'; break;
      case 3: this.textByType = 'Feedback'; break;
    }
  }

}
