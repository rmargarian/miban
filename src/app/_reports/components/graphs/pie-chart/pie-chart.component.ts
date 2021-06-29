import {Component, OnInit} from '@angular/core';
import {GraphsBaseComponent} from '@app/_reports/components/graphs/graphs-base/graphs-base.component';

import * as d3 from 'd3';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss', '../graphs-base/graphs-base.component.scss']
})
export class PieChartComponent extends GraphsBaseComponent implements OnInit {
  private arc: any;
  private pie: any;
  private colorFn;
  private radius;
  private selectedLegends = [];

  ngOnInit() {
    this.data.reverse();
    this.svgHeight = 450;
    this.svgWidth = 900;
    this.toolTip = this.createAndAppendTooltip();
    this.colorFn = d3.scaleOrdinal()
      .range(['rgb(148, 174, 10)', 'rgb(174, 10, 10)', 'rgb(17, 95, 166)',
        'rgb(255, 209, 62)', 'rgb(255, 136, 9)', 'rgb(166, 17, 32)']
        .concat(d3.schemeCategory10))
      .domain(this.data.map(d => d.label));

    this.radius = (this.svgHeight - this.margin.top - this.margin.bottom) / 2;

    // It usual D3.js method, special to pie chart;
    this.arc = d3.arc()
      .outerRadius(this.radius)
      .innerRadius(0);

    this.pie = d3.pie()
      .sort((a, b) => {
        return b[this.fields[1]] - a.count[this.fields[1]];
      })
      .value((d) => {
        return d[this.fields[1]];
      });

    // create svg container and append to document;
    this.svgCanvas = d3.select(this.graphContainer.nativeElement).append('svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight)
      .attr('transform',
        'translate(' + (this.radius + this.margin.right) + ',' + (this.radius + this.margin.top) + ')');

    this.setDataToGraph(this.data);
    this.createLegend();
    this.svgElement = this.graphContainer.nativeElement.querySelector('svg');
  }


  /**
   * * function wrapper which is working with data;
   * It create relationships between data and html elements
   * append created elements to svg,
   * also create text-labels and append to html elements
   * add events mouse move, mouse leave , click
   * @param arr
   */
  private setDataToGraph(arr): void {

    const countSummary = this.data.reduce((accumulator, currentValue) => {
      return accumulator += currentValue.count;
    }, 0);

    const sectorUpdate = this.svgCanvas.selectAll('.arc')
      .data(this.pie(arr));

    const sector = sectorUpdate
      .enter()
      .append('g')
      .merge(sectorUpdate)
      .attr('class', 'arc')
      .on('mousemove', (d) => {
        if (this.enableTooltip) {
          this.showTooltip(d.data[this.usersFieldKey]);
        }
      })
      .on('mouseleave', () => {
        if (this.enableTooltip) {
          this.hideTooltip();
        }
      });

    sector.append('path')
      .attr('d', this.arc)
      .style('fill', (d) => {
        return this.colorFn(d.data[this.fields[0]]);
      });

    sector.append('text')
      .attr('transform', (d) => {
        return 'translate(' + this.arc.centroid(d) + ')';
      })
      .style('text-anchor', 'middle ')
      .attr('font-weight', '100')
      .attr('fill', 'white')
      .attr('z-index', '1000')
      .text((d) => {
        const percentageValue = (d.data.count / countSummary * 100).toFixed(0);
        return percentageValue !== '0' ? percentageValue + '%' : '';
      });

    sectorUpdate.exit().remove();
  }

  /**
   * function wrapper which is working with data;
   * It create relationship between data and html elements
   * this element called Legend will be append to SVG
   * add event click
   */
  private createLegend(): void {
    const legend = this.svgCanvas
      .append('g')
      .attr('transform', 'translate(-150, 0)')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 14)
      .attr('text-anchor', 'end');

    const container = legend.append('g')
      .selectAll('g')
      .data(this.data)
      .enter().append('g')
      .attr('transform', (d, i) => {
        return 'translate(20,' + ((0 + i * 30) - 25) + ')';
      });

    container.append('rect')
      .attr('x', this.svgHeight - 30)
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', (d) => {
        return this.colorFn(d[this.fields[0]]);
      });

    container.append('text')
      .attr('x', this.svgHeight)
      .attr('y', 9.5)
      .attr('dy', '0.32em')
      .attr('text-anchor', 'start')
      .text((d) => {
        return d[this.fields[0]];
      });
    this.addEventsToLegendsItems(container)
      .on('click', (clickedItem, i, elements) => {
        if (elements[i].clicked === undefined || elements[i].clicked === false) {
          elements[i].style.fill = 'rgb(166, 17, 32)';
          elements[i].clicked = true;
        } else {
          elements[i].style.fill = 'black';
          elements[i].clicked = false;
        }
        const arr = [];
        const index = this.selectedLegends.findIndex(item => item === clickedItem.label);
        if (index !== -1) {
          this.selectedLegends.splice(index, 1);
        } else {
          this.selectedLegends.push(clickedItem.label);
        }
      });
  }

}
