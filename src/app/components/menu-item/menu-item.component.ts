import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

/**
 * Menu has two levels of items:
 * parents ({'id', 'title', 'icon', 'selected', ...}[]) and each parent can have
 * children ({'id', 'title', 'icon', 'selected', ...}[])
 */
@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent implements OnInit {
  @Input() items: any[];
  @ViewChild('parentMenu', { static: true }) public parentMenu;
  @Output() chosen: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  itemChosen(item: any) {
    this.chosen.emit(item);
  }

}
