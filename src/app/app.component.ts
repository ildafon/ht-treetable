import { Component } from '@angular/core';
import { TableItem, EXAMPLE_DATA } from './tree-table/tree-table-datasource';
@Component({
  selector: 'ht-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  source: TableItem[] = EXAMPLE_DATA;
}
