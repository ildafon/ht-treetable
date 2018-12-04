import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

import { TreeTableDatasource, TableItem } from './tree-table-datasource';

import { MatPaginator, MatSort} from '@angular/material';
import { Observable } from 'rxjs';
import { LocalService} from '../services/local.service';

@Component({
  selector: 'ht-tree-table',
  templateUrl: './tree-table.component.html',
  styleUrls: ['./tree-table.component.scss'],
  animations: [
    trigger('rowExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({ height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class TreeTableComponent implements OnInit {
  
  columnsToDisplay: string[] = ['name'];
  dataSource: TreeTableDatasource;
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private dataService: LocalService) {}
  

  ngOnInit() {
    this.dataSource = new TreeTableDatasource(this.dataService, this.paginator, this.sort);
    
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
