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
export class HierTableComponent implements OnInit, OnDestroy {
  
  @Input() source: Observable<htFmsItemI[]>;
  @Input() columns: column[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  subscription: Subscription;
  data$ = new BehaviorSubject<htFmsItemI[]>([]);
  filterTextSubject$ = new BehaviorSubject<string>("");

  entities: htHashTableI;
  ids: string[];
  output: string[] = [];
  

  columnsToDisplay: string[];
  
  datasource: HierTableDataSource;

  constructor() {
    
  }

  ngOnInit() {   
      this.datasource = new HierTableDataSource(this.paginator, this.sort, this.source);
      


      this.subscription = this.source
      .pipe(
          map((rows: htFmsItemI[]) => 
            toHash(rows))            
      )
      .subscribe((result: htHashTableI) => {
        this.entities = result;
        this.ids = Object.keys(this.entities);
        this.initialize()
      });


      this.columnsToDisplay = this.columns.map(column => column.name);
  }

  initialize() {
    this.render();
    console.log('in initialize',this.data$.value);
    merge(
      this.paginator.page,
      this.filterTextSubject$
    )
    .subscribe( () => {
      this.render();
    })
  }

  render() {

    this.output.length = 0; // clear array
    
    this.getRootRowIds().forEach(id => 
      this.getDescendantIds(this.output, id));
    
    this.paginator.length = this.output.length;

    this.data$.next(this.getPagedData());
   
  }

  private getPagedData(): htFmsItemI[] {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    const currentPageIds = this.output.splice(startIndex, this.paginator.pageSize);
    return currentPageIds.map( id => this.entities[id].row);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getRootRowIds(target =[]): string[] {
    
    return this.ids.filter( id => 
      (this.entities[id].parentId === null)
      && (!this.entities[id].row.hidden) );
  }

  getRows() {
    return this.ids.map(id => this.entities[id].row);
  }

  isOpen(rowId) {
    return this.entities[rowId].row.open
  }


  toggle( rowId) {
    const open = this.entities[rowId].row.open
    this.entities[rowId].row.open = !open;
    this.render();
  }



  getDescendantIds(descendantIds: string[], rowId: string): void {
    descendantIds.push(rowId);
    if (this.isOpen(rowId)) {
      this.entities[rowId].childrenIds.forEach( (childId: string) => 
        this.getDescendantIds(descendantIds, childId));
    }
    
  }

  hideRow(id: string){
    if (this.ids.indexOf(id) > -1 ) this.entities[id].row.hidden = true
  }

  expandAll(){}

  hideAll(): void {
      this.ids.forEach( id => this.hideRow(id))
      this.render();
  }
  
  filterChanged($event) {
    
    if ($event.keyCode == 27 ) {
      this.hideAll();
      this.paginator.pageIndex = 0;
    }
    
      this.filterTextSubject$.next($event.target.value); 
  }

 

}
  




