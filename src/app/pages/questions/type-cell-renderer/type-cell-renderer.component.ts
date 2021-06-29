import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-type-cell-renderer',
  templateUrl: './type-cell-renderer.component.html',
  styleUrls: ['./type-cell-renderer.component.scss']
})
export class TypeCellRendererComponent implements OnInit {

  type: number;
  textType: string;
  constructor() { }

  ngOnInit() {

  }

  agInit(params: any): void {
    this.type = params.data.type;
    this.setTextByType(this.type);
  }

  setTextByType(type: number){
    switch (type) {
      case 1: this.textType = 'Multiple choise multi options'; break;
      case 2: this.textType = 'Multiple choise single options'; break;
      case 3: this.textType = 'Array'; break;
      case 4: this.textType = 'Order'; break;
      case 5: this.textType = 'Text'; break;
      case 6: this.textType = 'Numeric'; break;
      case 8: this.textType = 'Slider'; break;
    }
  }

}
