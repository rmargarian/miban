import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss']
})
export class FormInputComponent implements OnInit {
  @Input() label: string;
  @Input() labelWidth: string;
  @Input() required: boolean;
  @Input() count: number;

  constructor() { }

  ngOnInit() {
  }

}
