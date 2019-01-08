import { v4 as uuid } from 'uuid';

import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import {animate, state, style, transition, trigger, sequence} from '@angular/animations';

import { MatPaginator, MatSort, MatTable} from '@angular/material';
import {merge, Observable, of as observableOf, BehaviorSubject, Subscription} from 'rxjs';
import {
  catchError, 
  map, 
  startWith, 
  switchMap, 
  withLatestFrom
   } from 'rxjs/operators';


import { htFmsItemI, htHashItemC, htHashTableI, column } from '../models';
import { toHash } from '../utils';


import {HierTableDataSource} from './hier-table-datasource';


@Component({
  selector: 'ht-hier-table',
  templateUrl: './hier-table.component.html',
  styleUrls: ['./hier-table.component.scss'],
  animations: [
    
    trigger('rowsAnimation', [
      transition('void => *', [
        style({ height: '*', opacity: '0',  'box-shadow': 'none' }),
        sequence([
          animate(".35s ease", style({ height: '*', opacity: '.2',  'box-shadow': 'none'  })),
          animate(".35s ease", style({ height: '*', opacity: 1  }))
        ])
      ])
    ])
  ],
 
})
export class HierTableComponent implements OnInit {
  
  @Input() source: Observable<htFmsItemI[]>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  public datasource: HierTableDataSource;

  columns: column[];
  columnsToDisplay: string[];

  ngOnInit() {   
      this.datasource = new HierTableDataSource(this.paginator, this.sort, this.source);
      this.getColumns();
  }

  toggle( rowId) {
    this.datasource.toggle(rowId);
  }

  getColumns() {
    this.columns = this.datasource.getColumns();
    this.columnsToDisplay = this.columns.map(column => column.name)
  }

}
  




