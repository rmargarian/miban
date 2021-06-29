import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SvgToImgService {
  canvas: HTMLCanvasElement = <HTMLCanvasElement>document.createElement('CANVAS');
  DOMURL = window.URL || (<any>window).webkitURL;

  constructor() {
  }

  public d3SvgToPng(svgNode): Promise<string> {
    return new Promise((resolve, reject) => {
      const svgWidth = svgNode.width.baseVal.value;
      const svgHeight = svgNode.height.baseVal.value;
      const svgString = new XMLSerializer().serializeToString(svgNode);
      const svg = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
      const image: HTMLImageElement = <HTMLImageElement>document.createElement('IMG');
      image.src = this.DOMURL.createObjectURL(svg);
      image.onload = () => {
        this.canvas.width = svgWidth;
        this.canvas.height = svgHeight;
        const ctx = this.canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.drawImage(image, 0, 0);
        const imgBase64 = this.canvas.toDataURL('image/png', 1.0);
        resolve(imgBase64);
        ctx.clearRect(0, 0, svgWidth, svgHeight);
      };
    });
  }
}
