import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import {animate, state, style, transition, trigger, sequence} from '@angular/animations';

import { MatPaginator, MatSort, MatTable} from '@angular/material';
import {Observable} from 'rxjs';

import { htFmsItemI, htHashItemC, htHashTableI, column } from './models';
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
          animate(".1s ease", style({ height: '*', opacity: '.2',  'box-shadow': 'none'  })),
          animate(".1s ease", style({ height: '*', opacity: 1  }))
        ])
      ])
    ])
  ],
 
})
export class HierTableComponent implements OnInit {
  
  @Input() source: Observable<htFmsItemI[]>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  public ds: HierTableDataSource;

  ngOnInit() {   
      this.ds = new HierTableDataSource(this.paginator, this.sort, this.source);
  }
}