import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-graph-type-cell-renderer',
  templateUrl: './graph-type-cell-renderer.component.html',
  styleUrls: ['./graph-type-cell-renderer.component.scss']
})
export class GraphTypeCellRendererComponent implements OnInit {

  graphType: number;
  graphText: string;

  constructor() {
  }

  ngOnInit() {
  }

  agInit(params: any): void {
    this.graphType = params.data.question_graph_type;
    this.setTextByType(this.graphType);
  }

  setTextByType(type: number) {
    switch (type) {
      case 1 : this.graphText = 'Bar Plot'; break;
      case 2 : this.graphText = 'Pie Plot'; break;
      case 3 : this.graphText = 'Radar'; break;
    }
  }

}
