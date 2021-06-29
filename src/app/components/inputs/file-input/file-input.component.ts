import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import { InputComponent } from '../input.component';

/**
 * Component overwrites input file styles,
 * and returns chosen file (only one, no multiple support) to parrent component.
 * Extends all field from InputComponent.
 * Additional fields: 'accept' (accepted files formats).
 */
@Component({
  selector: 'app-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss']
})
export class FileInputComponent extends InputComponent implements OnInit {
  @ViewChild('file', { static: false }) file;
  @Input() accept: string = '';
  @Output() chosen: EventEmitter<File> = new EventEmitter();

  ngOnInit() {
  }

  onChange(e: Event) {
    this.chosen.emit((<HTMLInputElement>e.target).files[0]);
  }

  selectFile() {
    this.file.nativeElement.click();
  }

  resetInput() {
    this.file.nativeElement.value = '';
  }

}
