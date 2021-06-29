import {Component, ElementRef, Input, ViewChild, AfterViewInit, OnDestroy} from '@angular/core';
import {CalcTextWidthService} from '@app/_reports/services/calc-text-width.service';
import {MatDialog} from '@angular/material';
import {formatUserInfo} from '../graphs-utils';
import {QuestionnaireType} from '@app/enums/questionnaire-type';

import * as d3 from 'd3';

@Component({
  selector: 'app-graphs-base',
  template: ``,
  styleUrls: ['./graphs-base.component.scss']
})
export class GraphsBaseComponent implements AfterViewInit, OnDestroy {
  @ViewChild('graphContainer', { static: true }) graphContainer: ElementRef;

  @Input() data;
  @Input() maxDataValue;
  @Input() usersInfoMap;
  @Input() series;
  @Input() axes;
  @Input() fields;
  @Input() usersFieldKey;
  @Input() enableTooltip = true;
  @Input() parentRef;
  @Input() hideEmptyResponses: boolean = true;

  protected svgHeight;
  protected svgWidth;
  protected toolTip;
  protected showInLegend: boolean;
  protected maxLabelWidth: number;
  protected xScaleFn: any;
  protected yScaleFn: any;
  protected svgCanvas: any;
  protected ticksCounter: number;
  protected margin = {top: 20, right: 20, bottom: 20, left: 120};
  protected xAxisObj;
  protected yAxisObj;
  protected y;
  protected tooltipClass = 'toolTip';

  public svgElement: any;
  public id: string;

  constructor(private dialog: MatDialog, protected calcService: CalcTextWidthService, private element: ElementRef) {
  }

  ngAfterViewInit() {
    if (this.parentRef && this.parentRef.registerGraph) {
      this.parentRef.registerGraph(this);
    }
    this.id = 'gid' + new Date().getTime();
    this.element.nativeElement.id = this.id;
  }

  ngOnDestroy() {
    if (this.parentRef && this.parentRef.unregisterGraph) {
      this.parentRef.unregisterGraph(this);
    }
  }

  /**
   * main function which is creating:
   * main SVG Container,
   * create x,y scaling function
   * create y and x Axis,
   * create tooltip,
   * set x, y object from data
   * calculate label width
   * set how many ticks will be in x Axis
   * base function, bar chart call this
   * @param {number} svgContainerWidth
   * @param {number} ticksDistance
   * @param {number} maxDataValueAdjustment
   */
  protected setup(svgContainerWidth: number, ticksDistance: number, maxDataValueAdjustment: number = 0) {
    this.axes.forEach(axis => {
      if (axis.position === 'bottom') {
        this.xAxisObj = axis;
      }
      if (axis.position === 'left') {
        this.yAxisObj = axis;
      }
    });

    this.calcHeightAndWidthSvgContainer(this.data, svgContainerWidth);
    this.maxLabelWidth = this.calcMaxLabelsWidth();
    this.xScaleFn = this.xScale(
      this.showInLegend ? this.maxLabelWidth + 120 : this.maxLabelWidth,
      this.maxDataValue + maxDataValueAdjustment);
    this.yScaleFn = this.yScale();
    this.svgCanvas = this.createSvgContainer(this.maxLabelWidth);
    this.svgElement = this.graphContainer.nativeElement.querySelector('svg');
    this.createAndAppendFilterToSvg(this.svgCanvas);
    this.ticksCounter = Math.floor((this.svgWidth - this.maxLabelWidth - this.margin.right) / ticksDistance);
    this.createAxes(this.showInLegend ? this.maxLabelWidth + 120 : this.maxLabelWidth);
  }

  /**
   * First remove line breaks (they were added on back-end side by mistake).
   * Then split long question's labels
   */
  protected splitLables() {
    let maxLabelLength = 0;
    this.data.forEach(elem => {
      if (elem.label && elem.label.length > maxLabelLength) {
        maxLabelLength = elem.label.length;
      }
    });
    this.data.forEach(elem => {
      if (elem.label) {
        elem.label = elem.label.replace(/(?:\r\n|\r|\n)/g, '');
        const stepLength = maxLabelLength > 115 ? 70 : 55;
        elem.label = this.splitLongString(elem.label, stepLength);
      }
    });
  }

  /**
   * Split long labels with a new line translation to solve issue with graph width
   * @param option
   * @param stepLength
   */
  private splitLongString(option, stepLength) {
    let passedWordsLength = 0;
    let wordsArray = option.split(' ');
    let separationIndexes = [];

    for (let i = 0; i < wordsArray.length; i++) {
      const word = wordsArray[i];
      if ((word.length + passedWordsLength) > stepLength * (separationIndexes.length + 1)) {
        separationIndexes.push(i);
      }
      passedWordsLength += word.length + 1;
    }

    separationIndexes.forEach(index => {
      wordsArray.splice(index, 0, '\n');
    });

    return wordsArray.join(' ');
  }

  /**
   * function helper, help calculate svg total width and height
   * @param {any[]} data
   * @param {number} width
   */
  protected calcHeightAndWidthSvgContainer(data: any[], width: number): void {
    const counterLabels = data.length;
    this.svgHeight = counterLabels * 50;
    this.svgWidth = width;
  }

  /**
   * function wrapper over D3.js function x scaling
   * @param {number} labelWidth
   */
  protected xScale(labelWidth: number, maxDataValue: number) {
    return d3.scaleLinear()
      .domain([0, maxDataValue])
      .range([0, this.svgWidth - labelWidth - this.margin.right]);
  }

  /**
   * function wrapper over D3.js function y scaling
   */

  protected yScale() {
    return d3.scaleBand()
      .range([this.svgHeight, 0])
      .padding(0.3)
      .domain(this.data.map((d) => {
        return d[this.yAxisObj.fields[0]];
      }));
  }

  /**
   * function wrapper of D3.js function which return instance of Tooltip object
   */
  protected createAndAppendTooltip() {
    return d3.select(this.graphContainer.nativeElement)
      .append('div')
      .attr('class', this.tooltipClass);
  }

  protected showTooltip(d: any[]): void {
    if (!this.toolTip) {
      this.toolTip = this.createAndAppendTooltip();
    }
    let userInfoList = '';
    d.forEach((id, i) => {
      userInfoList += this.formatUserInfo(this.usersInfoMap.get(id).user || this.usersInfoMap.get(id));
      // Add score to end of users' info
      if (this.usersInfoMap.get(id).questionnaireType === QuestionnaireType.ASSESSMENT ||
          this.usersInfoMap.get(id).questionnaireType === QuestionnaireType.FEEDBACK) {
        userInfoList += ' - ' + (this.usersInfoMap.get(id).score);
      }
      if (this.usersInfoMap.get(id).questionnaireType === QuestionnaireType.ASSESSMENT) {
        userInfoList += '%';
      }
      if (i !== d.length - 1) {
        userInfoList += '<br>';
      }
    });
    this.toolTip
      .style('display', 'inline-block')
      .html(userInfoList);

    /**
     * Adjust tooltip to fit the screen
     * @type {number}
     */
    const offsetX = 50;
    const offsetY = 70;
    const tooltipHeight = this.toolTip.node().offsetHeight;
    const tooltipWidth = this.toolTip.node().offsetWidth;
    const mouseX = d3.event.clientX;
    const mouseY = d3.event.clientY;
    const screenHeight = document.body.offsetHeight;
    const screenWidth = document.body.offsetWidth;

    let tooltipXPos = d3.event.pageX - offsetX;
    let tooltipYPos = d3.event.pageY - offsetY;

    /**
     * Check if tooltip overflows screen and shift it if so.
     * @type {number}
     */
    const screenOverflowX = screenWidth - (mouseX + tooltipWidth + 20);
    const screenOverflowY = screenHeight - (mouseY + tooltipHeight + 20);

    if (screenOverflowX < 0) tooltipXPos = tooltipXPos + screenOverflowX;
    if (screenOverflowY < 0) tooltipYPos = tooltipYPos + screenOverflowY;

    this.toolTip
      .style('left', tooltipXPos + 'px')
      .style('top', tooltipYPos + 'px');
  }

  protected hideTooltip(): void {
    const relatedTarget = d3.event.relatedTarget;
    if (!this.toolTip || !relatedTarget) { return; }

    if (!relatedTarget.classList.contains(this.tooltipClass)) {
      this.toolTip.style('display', 'none');
    } else {
      /**
       * If mouse went on tooltip panel hide it on mouseout
       */
      const onTooltipMouseOut = () => {
        this.toolTip.style('display', 'none');
        relatedTarget.removeEventListener('mouseout', onTooltipMouseOut);
      };

      relatedTarget.addEventListener('mouseout', onTooltipMouseOut);
    }
  }

  /**
   * function - helper which is working with calc service
   * when you want calc some label length , you should pass object style {StyleObject} interface
   * @returns {number}
   */

  protected calcMaxLabelsWidth() {
    this.calcService.setStyles({fontSize: '15px', padding: '0 15px'});
    let maxWidth = 0;
    this.data.forEach(item => {
      const serviceWidth = this.calcService.calcWidthText(item.label);
      if (serviceWidth > maxWidth) {
        maxWidth = serviceWidth;
      }
    });
    this.calcService.dropStyles();
    return maxWidth;
  }

  /**
   * function-wrapper of D3.js which create object SVG and append to container;
   * @param {number} labelWidth
   */

  protected createSvgContainer(labelWidth = 0) {
    return d3.select(this.graphContainer.nativeElement).append('svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight)
      .attr('transform',
        'translate(' + labelWidth + ',' + this.margin.top + ')');
  }

  /**
   * function-wrapper of D3.js which create x Axis  and append to container;
   * also configuring  count of ticks
   * @param svg
   * @param xScaleFn
   * @param ticksCounter
   */

  protected createAxisBottom(svg, xScaleFn, ticksCounter?) {
    return svg.append('g')
      .attr('transform', 'translate(0,' + this.svgHeight + ')')
      .call(d3.axisBottom(xScaleFn)
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

  /**
   * function-wrapper of D3.js which create y Axis  and append to container;
   * @param svg
   * @param yScaleFn
   */

  protected createAxisLeft(svg, yScaleFn) {
    return svg.append('g')
      .call(d3.axisLeft(yScaleFn))
      .attr('font-size', '15px');
  }

  /**
   * function-wrapper of D3.js which create and append to x Axis last tick with maxDataValue;
   * @param labelWidth
   */

  protected appendMaxDataValueToAxis(svg, labelWidth) {
    svg.append('text')
      .attr('class', 'maxValue')
      .attr('text-anchor', 'middle')
      .attr('font-size', '15px')
      .attr('fill', '#212529')
      .attr('font-weight', '400')
      .text(this.maxDataValue)
      .attr('transform', 'translate(' + (this.svgWidth - labelWidth - this.margin.right) + ', ' +
        (this.svgHeight + this.margin.bottom) + ')');
  }


  /**
   *  function which create and configure svg filter wiith box shadow and blur
   * append to svg container and set unique ID
   * @param svg
   */
  protected createAndAppendFilterToSvg(svg) {
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'dropshadow');

    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 1)
      .attr('result', 'blur');
    filter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 1)
      .attr('dy', 1)
      .attr('result', 'offsetBlur');

    const feMerge = filter.append('feMerge');

    feMerge.append('feMergeNode')
      .attr('in', 'offsetBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');
  }

  /**
   * function-helper which create str from object prop and return it;
   * @param userObj
   * @returns {string}
   */

  protected formatUserInfo(user) {
    return formatUserInfo(user);
  }

  protected createAxes(labelWidth: number) {
    this.createAxisBottom(this.svgCanvas, this.xScaleFn, this.ticksCounter)
      .selectAll('line').remove();

    this.y = this.createAxisLeft(this.svgCanvas, this.yScaleFn);
    this.y.selectAll('line').remove();

    this.appendMaxDataValueToAxis(this.svgCanvas, labelWidth);
  }


  protected addEventsToLegendsItems(legend) {
    return legend
      .on('mousemove', function (d, i, elements) {
        elements[i].children[1].style.fontWeight = '700';
      })
      .on('mouseout', function (d, i, elements) {
        elements[i].children[1].style.fontWeight = '400';
      });
  }
}
