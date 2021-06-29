import { Component, OnInit, Input } from '@angular/core';
import { GraphsBaseComponent } from '@app/_reports/components/graphs/graphs-base/graphs-base.component';
import * as d3 from 'd3';

@Component({
  selector: 'app-bar-chart-horizontal',
  templateUrl: './bar-chart-horizontal.component.html',
  styleUrls: ['./bar-chart-horizontal.component.scss', '../graphs-base/graphs-base.component.scss']
})
export class BarChartHorizontalComponent extends GraphsBaseComponent implements OnInit {
  @Input() color = '#94AE0A';

  ngOnInit() {
    if (this.hideEmptyResponses) {
      const usersCount = this.usersInfoMap.size;
      const threshold = usersCount / 10;
      this.data = this.data.filter((elem) => {
        return elem.count > threshold;
      });
      this.data = this.data.sort((a, b) => (a.count > b.count) ? -1 : 1);
    }

    this.splitLables();
    this.margin.left = 60;
    this.maxLabelWidth = this.calcMaxLabelsWidth();
    const svgContainerHeight: number = 300 + this.maxLabelWidth;

    this.axes.forEach(axis => {
      if (axis.position === 'bottom') {
        this.yAxisObj = axis;
      }
      if (axis.position === 'left') {
        this.xAxisObj = axis;
      }
    });

    this.calcHeightAndWidthSvgContainer(this.data, svgContainerHeight);
    this.xScaleFn = this.xScale(
      this.showInLegend ? this.maxLabelWidth + 120 : this.maxLabelWidth,
      this.maxDataValue);
    this.yScaleFn = this.yScale();
    this.svgCanvas = this.createSvgContainer(this.maxLabelWidth);
    this.svgElement = this.graphContainer.nativeElement.querySelector('svg');
    this.createAndAppendFilterToSvg(this.svgCanvas);
    this.ticksCounter = Math.round((this.svgHeight - this.maxLabelWidth - this.margin.top) / 100);
    this.createAxes(this.showInLegend ? this.maxLabelWidth + 120 : this.maxLabelWidth);

    this.setDataToGraph();
  }

  /**
   * function wrapper which is working with data;
   * It create relationship between data and html elements
   * append created elements to svg,
   * also create text-labels and append to html elements
   */

  private setDataToGraph(): void {
    let hasResponses = false;

    for (const answers of this.data) {
      if (answers.count > 0) {
        hasResponses = true;
        break;
      }
    }

    if (!hasResponses) { return; }

    const barRowWrappers = this.svgCanvas.selectAll('.bar-row-wrapper')
      .data(this.data)
      .enter()
      .append('g')
      .attr('class', 'bar-row-wrapper');

    barRowWrappers
      .append('rect')
      .attr('class', 'rect-bar')
      .attr('filter', 'url(' + window.location.href + '#dropshadow)')
      .attr('y', (d) => {
        return this.yScaleFn(d[this.yAxisObj.fields[0]]);
      })
      .attr('x', (d) => {
        return this.xScaleFn(d[this.xAxisObj.fields[0]]);
      })
      .attr('width', this.xScaleFn.bandwidth())
      .attr('height', (d) => {
        const height = this.svgHeight - this.maxLabelWidth - this.margin.top;
        return height - this.yScaleFn(d.count);
      })
      .style('fill', this.color)
      .on('mousemove', (d, i, elements) => {
        elements[i].style.stroke = '#5555cf';
        elements[i].style.opacity = '0.9';
        elements[i].style.strokeWidth = '2';
        if (this.enableTooltip) {
          const usersField = d.hasOwnProperty('delegates') ? 'delegates' : 'participants';
          this.showTooltip(d[usersField]);
        }
      })
      .on('mouseout', (d, i, elements) => {
        elements[i].style.stroke = 'none';
        elements[i].style.fill = this.color;
        elements[i].style.opacity = '1';
        if (this.toolTip) {
          this.toolTip.style('display', 'none');
        }
        if (this.enableTooltip) {
          this.hideTooltip();
        }
      });

    barRowWrappers
      .append('text')
      .attr('class', 'bartext')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-weight', '700')
      .attr('x', (d) => {
        return this.xScaleFn(d[this.xAxisObj.fields[0]]);
      })
      .attr('y', (d) => {
        return this.yScaleFn(d[this.yAxisObj.fields[0]] / 2);
      })
      .text((d) => {
        let text = d[this.yAxisObj.fields[0]];
        if (text === 0) {
          text = '';
        }
        return text;
      })
      .attr('transform', 'translate(17,5)');
  }

  protected createSvgContainer(labelWidth = 0) {
    return d3.select(this.graphContainer.nativeElement).append('svg')
      .attr('width', this.svgWidth + this.margin.left + this.margin.right)
      .attr('height', this.svgHeight + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight)
      .attr('transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  /**
   * function wrapper over D3.js function x scaling
   * @param {number} labelWidth
   */
  protected xScale(labelWidth: number, maxDataValue: number) {
    return d3.scaleBand()
      .range([0, this.svgWidth])
      .padding(0.3)
      .domain(this.data.map((d) => {
        return d[this.xAxisObj.fields[0]];
      }));
  }

  protected yScale() {
    return d3.scaleLinear()
      .domain([0, d3.max(this.data, function (d) {  return d.count; })])
      .range([this.svgHeight - this.maxLabelWidth - this.margin.top, 0]);
  }

  protected calcHeightAndWidthSvgContainer(data: any[], width: number): void {
    const counterLabels = data.length;
    this.svgWidth = counterLabels * 50;
    this.svgHeight = width;
  }

  protected createAxisBottom(svg, xScaleFn, ticksCounter?) {
    const g = svg.append('g')
      .attr('transform', 'translate(0,' + (this.svgHeight - this.maxLabelWidth - this.margin.top) + ')')
      .call(d3.axisBottom(xScaleFn)
        .ticks(ticksCounter)
        .tickFormat((tick, i, ticks) => {
          return tick;
        }))
      .attr('font-size', '15px')
      .selectAll('text')
      .attr('y', this.maxLabelWidth > 60 ? '0' : '15')
      .attr('x', this.maxLabelWidth > 60 ? '-10' : '0')
      .attr('dy', '.35em')
      .attr('transform', 'rotate(' + (this.maxLabelWidth > 60 ? 270 : 0 ) + ')')
      .style('text-anchor', this.maxLabelWidth > 60 ? 'end' : 'middle');

      g.select(function() { return this.parentNode; })
      .selectAll('line').remove();
  }

  protected createAxisLeft(svg, yScaleFn) {
    const ticksCounter = this.ticksCounter;
    return svg.append('g')
      .call(d3.axisLeft(yScaleFn)
        .ticks(ticksCounter)
        .tickFormat((tick, i, ticks) => {
          const step = ticks.length > 1 ? ticks[1].__data__ : 0;

          if (tick !== this.maxDataValue && tick % 1 === 0 && i !== ticks.length - 1) {
            return tick;
          } else if (i === ticks.length - 1 && step &&
            ((tick + step / 2) < this.maxDataValue  || (this.maxDataValue - tick) > 15)) {
            return tick;
          } else {
            return '';
          }
        }))
      .attr('font-size', '15px');
  }

  protected appendMaxDataValueToAxis(svg, labelWidth) {
    svg.append('text')
      .attr('class', 'maxValue')
      .attr('text-anchor', 'middle')
      .attr('font-size', '15px')
      .attr('fill', '#212529')
      .attr('font-weight', '400')
      .text(this.maxDataValue)
      .attr('transform', 'translate(-18, 5)');
  }

  protected createAxes(labelWidth: number) {
    this.createAxisBottom(this.svgCanvas, this.xScaleFn, this.ticksCounter);

    this.y = this.createAxisLeft(this.svgCanvas, this.yScaleFn);
    this.y.selectAll('line').remove();

    this.appendMaxDataValueToAxis(this.svgCanvas, labelWidth);
  }
}
