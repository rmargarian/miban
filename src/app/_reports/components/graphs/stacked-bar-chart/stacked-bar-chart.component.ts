import { Component, Input, OnInit } from '@angular/core';
import { GraphsBaseComponent } from '@app/_reports/components/graphs/graphs-base/graphs-base.component';
import { AnswerTypes, FaceCodes } from '@app/enums';

import * as d3 from 'd3';

@Component({
  selector: 'app-stacked-bar-chart',
  templateUrl: './stacked-bar-chart.component.html',
  styleUrls: ['./stacked-bar-chart.component.scss', '../graphs-base/graphs-base.component.scss']
})
export class StackedBarChartComponent extends GraphsBaseComponent implements OnInit {
  private colorRangeFn;
  private selectedLegends = [];
  @Input() questionnaireType;
  @Input() isFaces;
  @Input() isForEmail;
  @Input() axesColors;
  private xScaleAdjustment: number = 0;

  ngOnInit() {
    this.splitLables();
    this.fields = this.fields.filter(key => {
      return key !== 'label' && key !== 'delegates';
    });
    this.addMetaDataToChartBlocks();
    if (this.series[0].hasOwnProperty('showInLegend')) {
      this.showInLegend = this.series[0].showInLegend;
    }
    super.setup(900, 180, this.xScaleAdjustment);
    this.y.selectAll('text')
      .attr('class', 'cateName')
      .style('text-anchor', 'end')
      .call(this.wrapText, this.maxLabelWidth);

    this.colorRangeFn = this.createColorFnFromType();
    this.setDataToGraph(this.data);

    // if variable equal to true show legend
    if (this.showInLegend) {
      this.appendLegend();
    }
  }

  /**
   * working with data array
   * create new property in Object with (x, y, key , value) values, that object will be used to create char blocks;
   * set total value which is equal to maximum number of replies.
   * We also need to calculate xScaleAdjustment, because if data has value less then 3 we manually setting
   * width to 3 to make it look nice. Later we will use xScaleAdjustment for xScale function to show correct size for
   * the x axis
   */
  private addMetaDataToChartBlocks(): void {
    let maxRowAdjustment = this.xScaleAdjustment;
    this.data.forEach((d) => {
      let rowAdjustment = 0;
      let x0 = 0;
      d.values = [];
      this.fields.forEach(field => {
        if (d.hasOwnProperty(field)) {
          let width = +d[field];
          /**
           * if data has value less then 3 we manually setting block width to 3 to make it look nice.
           * Use such fix only if we have large scale - maxDataValue > 50
           */
          if (width > 0 && width <= 3 && this.maxDataValue > 50) {
            rowAdjustment += 3 - width;
            width = 3;
          }
          d.values.push({
            key: field,
            x0: x0,
            x1: x0 += width,
            label: d.label,
            value: +d[field]
          });
        }
      });
      if (rowAdjustment > maxRowAdjustment) {
        maxRowAdjustment = rowAdjustment;
      }
      d.total = this.maxDataValue;
    });
    this.xScaleAdjustment = maxRowAdjustment;
  }


  /**
   * function wrapper which is working with data;
   * It create relationship between data and html elements
   * append created elements to svg,
   * also create text-labels and append to html elements
   * @param data
   */
  private setDataToGraph(data): void {
    const barRowWrappersUpdate = this.svgCanvas.selectAll('.bar-row-wrapper')
      .data(data);

    const barRowWrappers = barRowWrappersUpdate
      .enter()
      .append('g')
      .merge(barRowWrappersUpdate)
      .attr('class', 'bar-row-wrapper')
      .attr('filter', 'url(' + window.location.href + '#dropshadow)')
      .attr('transform', (d) => {
        return 'translate(2, ' + this.yScaleFn(d.label) + ')';
      });

    barRowWrappersUpdate.exit().remove();

    const colorContainersUpdate = barRowWrappers
      .selectAll('.color_container')
      .data(function (d) {
        return d.values;
      });

    const box = colorContainersUpdate.enter()
      .append('g')
      .on('mousemove', (d, i, elements) => {
        elements[i].children[0].style.stroke = 'blue';
        elements[i].children[0].style.strokeWidth = '2';
        elements[i].children[0].style.strokeOpacity = '0.3';
        elements[i].children[0].style.opacity = '0.8';
        let obj;
        this.data.forEach(item => {
          if (item.label === d.label) obj = item;
        });
        if (this.enableTooltip) {
          this.showTooltip(obj[this.usersFieldKey][d.key]);
        }
      })
      .on('mouseleave', (d, i, elements) => {
        elements[i].children[0].style.stroke = '';
        elements[i].children[0].style.strokeWidth = '';
        elements[i].children[0].style.opacity = '';
        elements[i].children[0].style.strokeOpacity = '';

        if (this.enableTooltip) {
          this.hideTooltip();
        }
      });

    box
      .append('rect')
      .attr('class', 'color_container')
      .attr('height', this.yScaleFn.bandwidth())
      .merge(colorContainersUpdate)
      .attr('x', (d) => {
        return this.xScaleFn(d.x0);
      })
      .attr('width', (d) => {
        return this.xScaleFn(d.x1) - this.xScaleFn(d.x0);
      })
      .style('fill', (d) => {
        return this.colorRangeFn(d.key);
      })
      .style('outline-color', '#000000')
      .style('outline-offset', '-4px')
      .style('outline-style', 'solid')
      .style('outline-width', (d) => {
        return d.border ? '4px' : '0';
      })
      .attr('z-index', 100);


    colorContainersUpdate.exit().remove();

    const textContainersUpdate = barRowWrappers
      .selectAll('text')
      .data(function (d) {
        return d.values;
      });

    box
      .append('text')
      .merge(textContainersUpdate)
      .text(function (d) {
        const result = d.value;
        if (result !== 0) {
          return result;
        } else {
          return '';
        }
      })
      .attr('x', (d) => {
        return this.xScaleFn(d.x0) + this.xScaleFn((d.x1 - d.x0) / 2) - ((8 * ((d.x1 - d.x0).toString().length)) / 2);
      })
      .attr('y', this.yScaleFn.bandwidth() / 1.5)
      .style('fill', '#ffffff');

    textContainersUpdate.exit().remove();
  }

  /**
   * function wrapper which is working with data;
   * It create relationship between data and html elements
   * this element called Legend will be append to SVG.
   * if (this.isFaces === true):
   *  - don't add text to legend
   *  - use face icons instead of colored rects
   */
  private appendLegend(): void {
    const translate = (this.isFaces && !this.isForEmail) ? 'translate(0, 10)' : 'translate(0, 0)';
    const legend = this.svgCanvas
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('class', 'legend')
      .attr('font-size', 14)
      .attr('text-anchor', 'start')
      .attr('transform', (d) => {
        return translate;
      })
      .selectAll('g')
      .data(this.fields)
      .enter().append('g')

      .attr('transform', (d, i, arr) => {
        return 'translate(' + -(this.maxLabelWidth + 90) + ',' + (((this.svgHeight / 2) - arr.length * 12) + i * 25) + ')';
      });

    if (!this.isFaces || this.isForEmail) {
      legend.append('rect')
      .attr('x', this.svgWidth - 19)
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', (d) => {
        return this.colorRangeFn(d);
      });

      legend.append('text')
      .attr('x', this.svgWidth + 5)
      .attr('y', 9.5)
      .attr('dy', '0.32em')
      .text(function (d) {
        return d;
      });
    } else {
      legend.append('text')
      .attr('x', this.svgWidth - 19)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('font-family', 'Font Awesome 5 Free')
      .style('cursor', 'pointer')
      .style('font-size', '20px')
      .attr('class', 'fas')
      .attr('fill', (d) => {
        return this.colorRangeFn(d);
      })
      .text((d) => {
        return this.getFaceCode(d);
      });
    }


    this.addEventsToLegendsItems(legend)
      .on('click', (clickedItem, i, elements) => {
        if (elements[i].clicked === undefined || elements[i].clicked === false) {
          elements[i].style.fill = 'rgb(166, 17, 32)';
          elements[i].clicked = true;
        } else {
          elements[i].style.fill = 'black';
          elements[i].clicked = false;
        }

        this.data.forEach(label => {
          label.values.forEach(value => {
            if (value.border === true) {
              value.border = false;
            } else {
              value.border = value.key === clickedItem;
            }
          });
        });
        this.setDataToGraph(this.data);
      });
  }

  /**
   * function which is create array of colors and made relationship between key and color
   * @returns {object}
   */
  private createColorFnFromType(): object {
    return d3.scaleOrdinal(this.axesColors ||
      ['rgb(148, 174, 10)', 'rgb(17, 95, 166)', 'rgb(255, 209, 62)', 'rgb(255, 136, 9)',
        'rgb(166, 17, 32)', 'rgb(255, 192, 203)', 'rgb(80, 20, 0)', 'rgb(233, 30, 99)',
        'rgb(0, 188, 212)', 'rgb(156, 39, 176)'].concat(d3.schemeCategory10))
      .domain(this.fields);
  }

  private getFaceCode(answerType: string): string {
    switch (answerType) {
      case AnswerTypes.CORRECT:
        return FaceCodes.HAPPY;
      case AnswerTypes.INCORRECT:
      case AnswerTypes.NEGATIVE:
        return FaceCodes.SAD;
      case AnswerTypes.CONSOLATION:
        return FaceCodes.NEUTRAL;
    }

    return '';
  }

  /**
   * callback function which accepts y Axis
   * create formatted labels (if their length more longer than able maxWidth)
   * @param label
   */
  private wrapText(label): void {
    const div = document.createElement('DIV');
    label.each(function () {
      const text = d3.select(this);
      const textContent = text.text();
      const labelsArr = textContent.split('\n');
      let tspan = text.text(null);
      const x = -15,
        y = text.attr('y');
      let dy = 0.35;
      let rowCount = 0;
      labelsArr.forEach((str) => {
        rowCount++;
        div.innerHTML = str;
        tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em').text(div.innerText);
        dy = 1;
      });
      /** Make vertical alignment if more then one line of text */
      if (rowCount > 1) {
        text.attr('y', -4 * rowCount);
      }
    });
  }
}
