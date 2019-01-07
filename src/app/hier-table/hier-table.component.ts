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
import { fmsItem } from '../models/fms.model';


export class htHashItemC {
      id: string;
      row: fmsItem;
      parentId: string | null;
      childrenIds: string[] = []; 
}

export interface htHashTableI {
  [id:string]: htHashItemC
}


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
  
  @Input() source: Observable<fmsItem[]>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  
  output: fmsItem[];
  hashTable: htHashTableI;
  hashOutput: string[];

  subscription: Subscription;


  ngOnInit() {   
      this.subscription = this.source
      .pipe(
          map((rows: fmsItem[]) => 
            this.toHash(rows)
          )      
      )
      .subscribe((result) => {
        this.hashTable = result; 
        console.log(this.hashTable)
      });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private toHash(rows: fmsItem[]): htHashTableI {
    const sortedRows = this.getSortedRows(rows);

    return sortedRows.reduce( (obj, cur, idx, src) => {
      const hashItem = new htHashItemC();
      hashItem.id = cur.id;
      hashItem.row = cur;
      hashItem.parentId = this.getParentId(cur, src);
      hashItem.childrenIds = this.getChildrenIds(cur, src);

      obj[hashItem.id] = hashItem;
      return obj;
    }, {});
  }
  

  private getSortedRows(data: fmsItem[]){
    return [...data].sort((a,b) => (a.code > b.code) ? 1 : ((b.code > a.code) ? -1 : 0)); 

  }

  private getLevel( row: fmsItem) {
    if (!row.code || row.code.length === 0) return new Error('Incorrent row syntax');
    return ((<string>row.code).match(/\./g) || []).length + 1
  }
  
  private getParentId(row: fmsItem, array: fmsItem[]): string|null {
    const index = row.code.lastIndexOf('.');
    if (index > -1) {
      const parentCode = row.code.substring(0, index);
      const parentIndex = array.findIndex(t => t.code === parentCode);
      if (parentIndex > -1) {
        const parentRow = array[parentIndex];
       return  parentRow.id;
      }
    } else  return null; // No dots in code, then this row hasn`t parent
  }

  private getChildrenIds(row: fmsItem, array: fmsItem[]): string[] | null {
    const chilrenCodePattern = `//`
    return array.filter( elem => elem.code.startsWith(row.code) 
    && (elem.code.match(/\./g) || []).length === (row.code.match(/\./g) || []).length + 1 )
    .map( elem => elem.id)
  }

  
}



