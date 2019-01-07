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

import {dataApi} from '../services/local.service';

import { LocalService } from '../services/local.service';
import { htFmsItemI, htHashItemC, htHashTableI, column } from '../models';
import { toHash } from '../utils';





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
export class HierTableComponent implements OnInit, OnDestroy {
  
  @Input() source: Observable<htFmsItemI[]>;
  @Input() columns: column[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  subscription: Subscription;
  data: htFmsItemI[];

  entities: htHashTableI;
  ids: string[];
  output: string[] = [];
  

  columnsToDisplay: string[];
  

  ngOnInit() {   
      this.subscription = this.source
      .pipe(
          map((rows: htFmsItemI[]) => 
            toHash(rows)
          )      
      )
      .subscribe((result: htHashTableI) => {
        this.entities = result;
        this.ids = Object.keys(this.entities);
        this.selectRootRowIds().forEach(id => this.getDescendantIds(this.output, id));
        this.data = this.output.map( id => this.entities[id].row);
        console.log(this.output);
      });


      this.columnsToDisplay = this.columns.map(column => column.name);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  selectRootRowIds(): string[] {
    return this.ids.filter( id => this.entities[id].parentId === null );
  }

  getRows() {
    return this.ids.map(id => this.entities[id].row);
  }

  getDescendantIds(descendantIds: string[], rowId: string): void {
    descendantIds.push(rowId);
    const childrenIds = this.entities[rowId].childrenIds;
    childrenIds.forEach( (childId: string) => this.getDescendantIds(descendantIds, childId));
  }
  
}



