import { Component, OnInit, Input } from '@angular/core';
import { GraphsBaseComponent } from '@app/_reports/components/graphs/graphs-base/graphs-base.component';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss', '../graphs-base/graphs-base.component.scss']
})
export class BarChartComponent extends GraphsBaseComponent implements OnInit {
  @Input() color = '#94AE0A';

  ngOnInit() {
    if (this.hideEmptyResponses) {
      const usersCount = this.usersInfoMap.size;
      const threshold = usersCount / 10;
      this.data = this.data.filter((elem) => {
        return elem.count > threshold;
      });
      this.data = this.data.sort((a, b) => (a.count < b.count) ? -1 : 1);
    }

    this.splitLables();
    super.setup(680, 100);
    this.ticksCounter = Math.round((this.svgWidth - this.maxLabelWidth - this.margin.right) / 100);
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

    barRowWrappers.on('mousemove', (d, i, elements) => {
      elements[i].children[0].style.stroke = '#5555cf';
      elements[i].children[0].style.opacity = '0.9';
      elements[i].children[0].style.strokeWidth = '2';
      if (this.enableTooltip) {
        const usersField = d.hasOwnProperty('delegates') ? 'delegates' : 'participants';
        this.showTooltip(d[usersField]);
      }
    })
      .on('mouseout', (d, i, elements) => {
        elements[i].children[0].style.stroke = 'none';
        elements[i].children[0].style.fill = this.color;
        elements[i].children[0].style.opacity = '1';
        if (this.toolTip) {
          this.toolTip.style('display', 'none');
        }
        if (this.enableTooltip) {
          this.hideTooltip();
        }
      });

    barRowWrappers
      .append('rect')
      .attr('class', 'rect-bar')
      .attr('filter', 'url(' + window.location.href + '#dropshadow)')
      .attr('width', (d) => {
        // if (d[this.xAxisObj.fields[0]] > 0 && d[this.xAxisObj.fields[0]] <= 3) {
        //   return this.xScaleFn(3);
        // }
        return this.xScaleFn(d[this.xAxisObj.fields[0]]);
      })
      .attr('y', (d) => {
        return this.yScaleFn(d[this.yAxisObj.fields[0]]);
      })
      .attr('height', this.yScaleFn.bandwidth())
      .style('fill', this.color);

    barRowWrappers
      .append('text')
      .attr('class', 'bartext')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-weight', '700')
      .attr('x', (d) => {
        return this.xScaleFn(d[this.xAxisObj.fields[0]] / 2);
      })
      .attr('y', (d) => {
        return this.yScaleFn(d[this.yAxisObj.fields[0]]);
      })
      .text((d) => {
        let text = d[this.xAxisObj.fields[0]];
        if (text === 0) {
          text = '';
        }
        return text;
      })
      .attr('transform', 'translate(0, 22)');
  }
}
