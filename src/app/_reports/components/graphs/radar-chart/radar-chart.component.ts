import {Component, Input, OnInit} from '@angular/core';
import {GraphsBaseComponent} from '@app/_reports/components/graphs/graphs-base/graphs-base.component';

import * as d3 from 'd3';

@Component({
  selector: 'app-radar-chart',
  templateUrl: './radar-chart.component.html',
  styleUrls: ['./radar-chart.component.scss']
})
export class RadarChartComponent extends GraphsBaseComponent implements OnInit {

  @Input() groupAnswersByCompany;

  private radius;
  protected margin = {top: 80, right: 20, bottom: 120, left: 40};

  private answerOptionsKeyValueMap = {};
  private answerOptionsValueKeyMap = {};
  private maxOptionsValue: number;
  private colorFn;
  private layersInfo = [];

  ngOnInit() {
    this.svgHeight = 400;
    this.svgWidth = 900;

    this.radius = (this.svgHeight - this.margin.top - this.margin.bottom) / 2;

    this.fields.forEach((field, index) => {
      this.answerOptionsKeyValueMap[field] = index + 1;
      this.answerOptionsValueKeyMap[(index + 1).toString()] = field;
      if (index === this.fields.length - 1) {
        this.maxOptionsValue = index + 1;
      }
    });

    this.groupAnswersByCompany.forEach(companyData => {
      this.layersInfo.push(companyData.company.title + ' Average');
    });

    this.data.forEach(userData => {
      const user = this.usersInfoMap.get(userData.participantId);
      this.layersInfo.push(user.firstName + ' ' + user.lastName);
    });

    this.colorFn = this.createColorFn();
    this.setDataToGraph();
    this.createLegend();
    this.svgElement = this.graphContainer.nativeElement.querySelector('svg');
  }

  private setDataToGraph() {
    const transformedData = this.data.map(d => {
      return d.answers.map(answer => {
        return {
          axis: answer.axes,
          value: this.answerOptionsKeyValueMap[answer.labelSet.value],
        };
      });
    });

    /**
     * append average summary of companies
     */

    this.groupAnswersByCompany.forEach(answersByCompany => {
      const companyAverage = answersByCompany.answersByOptions.map(answerByOption => {
        const answersSum = answerByOption.answersByLabelSetOption.reduce((sum, value) => sum += value.answersCount, 0);
        const average = answersSum / answerByOption.answersByLabelSetOption.length;
        const differences = [];

        /**
         * Calculate difference of the label set option value from average. The less one means this is group average
         */
        for (let i = 0; i < answerByOption.answersByLabelSetOption.length; i++) {
          const answer = answerByOption.answersByLabelSetOption[i];
          /**
           * If there was zero answers we push Infinity so it won't be as the less difference
           * @type {number}
           */
          const diff = answer.answersCount ? Math.abs(answer.answersCount - average) : Infinity;
          differences.push(diff);
        }

        return {
          axes: answerByOption.axes,
          value: differences.indexOf(Math.min(...differences)) + 1
        };
      });

      transformedData.unshift(companyAverage);
    });

    this.buildRadarChart(transformedData);
  }

  private buildRadarChart(data) {
    const cfg = {
      w: this.svgWidth,				// Width of the circle
      h: this.svgHeight,  // Height of the circle
      legendPosition: {x: 20, y: 20},
      margin: this.margin,     // The margins of the SVG
      levels: this.maxOptionsValue,				// How many levels or inner circles should there be drawn
      maxValue: this.maxOptionsValue, 			// What is the value that the biggest circle will represent
      labelFactor: 1.25, 	// How much farther than the radius of the outer circle should the labels be placed
      wrapWidth: 100, 		// The number of pixels after which a label needs to be given a new line
      opacityArea: 0.2, 	// The opacity of the area of the blob
      dotRadius: 4, 			// The size of the colored circles of each blog
      opacityCircles: 0.1, 	// The opacity of the circles of each blob
      strokeWidth: 2, 		// The width of the stroke around each blob
      roundStrokes: false,	// If true the area and stroke will follow a round path (cardinal-closed)
      color: this.colorFn	// Color function
    };

    const maxValue = cfg.maxValue;

    const allAxis = this.axes,
      total = allAxis.length,					// The number of different axes
      radius = Math.min(cfg.w / 2, cfg.h / 2), 	// Radius of the outermost circle
      angleSlice = Math.PI * 2 / total;		// The width in radians of each 'slice'

    // Scale for the radius
    const rScale = d3.scaleLinear()
      .range([0, radius])
      .domain([0, maxValue]);

    /**
     * Create the container SVG and g
     */

    /**
     * Initiate the radar chart SVG
     */
    const svg = d3.select(this.graphContainer.nativeElement).append('svg')
      .attr('width', cfg.w + cfg.margin.left + cfg.margin.right)
      .attr('height', cfg.h + cfg.margin.top + cfg.margin.bottom);

    this.svgCanvas = svg;
    /**
     * Append a g element
     */
    const g = svg.append('g')
      .attr('transform', 'translate(' + (cfg.w / 2 - cfg.h / 2 + cfg.margin.left) + ',' + (cfg.h / 2 + cfg.margin.top) + ')');

    /**
     * Glow filter for some extra pizzazz
     * Filter for the outside glow
     */
    const filter = g.append('defs').append('filter').attr('id', 'glow'),
      feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
      feMerge = filter.append('feMerge'),
      feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
      feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    /**
     * Draw the Circular grid
     * Wrapper for the grid & axes
     */
    const axisGrid = g.append('g').attr('class', 'axisWrapper');

    // Draw the background circles
    axisGrid.selectAll('.levels')
      .data(d3.range(1, (cfg.levels + 1)).reverse())
      .enter()
      .append('circle')
      .attr('class', 'gridCircle')
      .attr('r', function (d, i) {
        return radius / cfg.levels * d;
      })
      .style('fill', '#CDCDCD')
      .style('stroke', '#CDCDCD')
      .style('fill-opacity', cfg.opacityCircles)
      .style('filter', 'url(#glow)');

    // Text indicating at what % each level is
    axisGrid.selectAll('.axisLabel')
      .data(d3.range(1, (cfg.levels + 1)).reverse())
      .enter().append('text')
      .attr('class', 'axisLabel')
      .attr('x', 4)
      .attr('y', function (d) {
        return -d * radius / cfg.levels;
      })
      .attr('dy', '0.4em')
      .style('font-size', '10px')
      .attr('fill', '#737373')
      .text((d, i) => {
        return this.answerOptionsValueKeyMap[d.toString()];
      });

    /**
     * Draw the axes
     * Create the straight lines radiating outward from the center
     */

    const axis = axisGrid.selectAll('.axis')
      .data(allAxis)
      .enter()
      .append('g')
      .attr('class', 'axis');
    // Append the lines
    axis.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', function (d, i) {
        return rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2);
      })
      .attr('y2', function (d, i) {
        return rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2);
      })
      .attr('class', 'line')
      .style('stroke', 'white')
      .style('stroke-width', '2px');

    // Append the labels at each axis
    axis.append('text')
      .attr('class', 'legend')
      .style('font-size', '11px')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('x', function (d, i) {
        return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2);
      })
      .attr('y', function (d, i) {
        return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2);
      })
      .text(function (d) {
        return d;
      })
      .call(this.wrap, cfg.wrapWidth);

    /**
     * Draw the radar chart blobs
     * The radial line function
     */

    const radarLine = d3.radialLine()
      .curve(d3.curveLinearClosed)
      .radius(function (d) {
        return rScale(d.value);
      })
      .angle(function (d, i) {
        return i * angleSlice;
      });

    if (cfg.roundStrokes) {
      radarLine.interpolate('cardinal-closed');
    }

    // Create a wrapper for the blobs
    const blobWrapper = g.selectAll('.radarWrapper')
      .data(data)
      .enter().append('g')
      .attr('class', 'radarWrapper');

    // Append the backgrounds
    blobWrapper
      .append('path')
      .attr('class', 'radarArea')
      .attr('d', function (d, i) {
        return radarLine(d);
      })
      .style('fill', (d, i) => {
        return cfg.color(this.layersInfo[i]);
      })
      .style('fill-opacity', cfg.opacityArea)
      .on('mouseover', function (d, i) {
        // Dim all blobs
        d3.selectAll('.radarArea')
          .transition().duration(200)
          .style('fill-opacity', 0.1);
        // Bring back the hovered over blob
        d3.select(this)
          .transition().duration(200)
          .style('fill-opacity', 0.7);
      })
      .on('mouseout', function () {
        // Bring back all blobs
        d3.selectAll('.radarArea')
          .transition().duration(200)
          .style('fill-opacity', cfg.opacityArea);
      });

    // Create the outlines
    blobWrapper.append('path')
      .attr('class', 'radarStroke')
      .attr('d', function (d, i) {
        return radarLine(d);
      })
      .style('stroke-width', cfg.strokeWidth + 'px')
      .style('stroke', (d, i) => {
        return cfg.color(this.layersInfo[i]);
      })
      .style('fill', 'none')
      .style('filter', 'url(#glow)');

    let layerCounter = 0;

    // Append the circles
    blobWrapper.selectAll('.radarCircle')
      .data(function (d, i) {
        return d;
      })
      .enter().append('circle')
      .attr('class', 'radarCircle')
      .attr('r', cfg.dotRadius)
      .attr('cx', function (d, i) {
        return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
      })
      .attr('cy', function (d, i) {
        return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
      })
      .style('fill', (d, i) => {
        const color = cfg.color(this.layersInfo[layerCounter]);
        if (i === this.axes.length - 1) {
          layerCounter++;
        }
        return color;
      })
      .style('fill-opacity', 0.8);

    /**
     * Append invisible circles for tooltip
     * Wrapper for the invisible circles on top
     */

    const blobCircleWrapper = g.selectAll('.radarCircleWrapper')
      .data(data)
      .enter().append('g')
      .attr('class', 'radarCircleWrapper');

    const answerOptionsValueKeyMap = this.answerOptionsValueKeyMap;

    // Append a set of invisible circles on top for the mouseover pop-up
    blobCircleWrapper.selectAll('.radarInvisibleCircle')
      .data(function (d, i) {
        return d;
      })
      .enter().append('circle')
      .attr('class', 'radarInvisibleCircle')
      .attr('r', cfg.dotRadius * 1.5)
      .attr('cx', function (d, i) {
        return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
      })
      .attr('cy', function (d, i) {
        return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
      })
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', function (d, i) {
        const newX = parseFloat(d3.select(this).attr('cx')) - 10;
        const newY = parseFloat(d3.select(this).attr('cy')) - 10;

        tooltip
          .attr('x', newX)
          .attr('y', newY)
          .text(() => {
            return answerOptionsValueKeyMap[d.value.toString()];
          })
          .transition().duration(200)
          .style('opacity', 1);
      })
      .on('mouseout', function () {
        tooltip.transition().duration(200)
          .style('opacity', 0);
      });

    // Set up the small tooltip for when you hover over a circle
    const tooltip = g.append('text')
      .attr('class', 'tooltip')
      .style('opacity', 0);
  }

  private wrap(texts, width) {
    texts.each(function () {
      const text = d3.select(this),
        y = text.attr('y'),
        x = text.attr('x'),
        words = text.text().split(/\s+/).reverse(),
        dy = parseFloat(text.attr('dy')),
        lineHeight = 1.4; // ems

      let word,
        line = [],
        lineNumber = 0,
        tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
        }
      }
    });
  }

  private createLegend(): void {
    const legend = this.svgCanvas
      .append('g')
      .attr('transform', 'translate(170, 400)')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 14)
      .attr('text-anchor', 'end');

    const container = legend.append('g')
      .selectAll('g')
      .data(this.layersInfo)
      .enter().append('g')
      .attr('transform', (d, i) => {
        return 'translate(20,' + ((0 + i * 30) - 25) + ')';
      });

    container.append('rect')
      .attr('x', this.svgHeight - 30)
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', (d, i) => {
        return this.colorFn(this.layersInfo[i]);
      });

    container.append('text')
      .attr('x', this.svgHeight)
      .attr('y', 9.5)
      .attr('dy', '0.32em')
      .attr('text-anchor', 'start')
      .text((d) => {
        return d;
      });
  }

  private createColorFn(): object {
    return d3.scaleOrdinal()
      .range(['rgb(148, 174, 10)', 'rgb(174, 10, 10)', 'rgb(17, 95, 166)',
        'rgb(255, 209, 62)', 'rgb(255, 136, 9)', 'rgb(166, 17, 32)']
        .concat(d3.schemeCategory10))
      .domain(this.layersInfo);
  }

}
