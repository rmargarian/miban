import { Injectable } from '@angular/core';

import * as d3 from 'd3';
import * as cloud from 'cloud';

import { EXCLUDES } from '@app/contants';

@Injectable({
  providedIn: 'root'
})
export class WordCloudService {
  private width: number = 900;
  private height: number = 450;
  private fill = d3.scaleOrdinal(d3.schemeCategory10);

  constructor() { }

  /**
   * Draws Words cloud in svg by passed text
   * @param text (string)
   * @param svg (d3.Selection<SVGElement>)
   */
  public drawWordCloud(text: string, svg: d3.Selection<SVGElement>) {
    const word_entries = this.getWordEntries(text);
    if (word_entries.length > 250) {
      this.height = 550;
    }
    let max = word_entries.length;
    let min = 8;
    if (max > 95) {
      max = 95;
    }
    if (max < 40) {
      min = 10;
      max = 40;
    }
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(word_entries, (d) => d.value)])
      .range([min, max]);

    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const width = this.width - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;

    svg
      .style('width', this.width + 'px')
      .style('height', this.height + 'px');

    const g = svg
      .append('g');

    const wordcloud = g.append('g')
      .attr('class', 'wordcloud')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    cloud().size([width, height])
      .timeInterval(20)
      .words(word_entries)
      .font('sans-serif')
      .fontSize((d) => {
        let size = xScale(+d.value);
        if (size > 85 && d.key.length > 8 && d.rotate) { d.rotate = 0; }
        else if (size < 8) { size = 8; }
        return size;
      })
      //.fontSize((d) => xScale(+d.value))
      //.fontWeight(['bold'])
      .text((d) => d.key)
      .rotate(() => ~~(Math.random() * 2) * 270)
      .spiral('rectangular') // 'archimedean' or 'rectangular'
      .on('end', (words_map) => {
        wordcloud.selectAll('text')
          .data(words_map)
          .enter().append('text')
          .attr('class', 'word')
          .style('fill', (d, i) => this.fill(i))
          .style('font-size', (d) => d.size + 'px')
          .style('font-family', (d) => d.font)
          .attr('font-family', 'sans-serif')
          .attr('text-anchor', 'middle')
          .attr('transform', (d) => 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')')
          .text((d) => d.text);
      })
      .start();
  }

  /**
   * Configures d3 entries from text
   * @param text (string)
   */
  private getWordEntries(text: string) {
    const word_count = {};
    const words = text.split(/[ '\(\)\*\=":;/\n\[\]|{},.!?]+/);

    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      while (word.charAt(0) === '-') {
        word = word.substr(1);
      }
      words[i] = word;
    }
    const common: string = EXCLUDES;

    if (words.length === 1) {
      word_count[words[0]] = 1;
    } else {
      words.forEach(function (word) {
        word = word.toLowerCase();
        if (word !== '' && common.indexOf(word) === -1 && word.length > 1) {
          if (word_count[word]) {
            word_count[word]++;
          } else {
            word_count[word] = 1;
          }
        }
      });
    }
    return d3.entries(word_count);
  }
}
