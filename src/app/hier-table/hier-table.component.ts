import { v4 as uuid } from 'uuid';

import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {animate, state, style, transition, trigger, sequence} from '@angular/animations';

import { MatPaginator, MatSort, MatTable} from '@angular/material';
import {merge, Observable, of as observableOf, BehaviorSubject} from 'rxjs';
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
      parentId: string;
      childrenIds: string[]; 
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
export class HierTableComponent implements OnInit {
  
  @Input() source: Observable<fmsItem[]>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  
  output: fmsItem[];
  hashTable: htHashTableI;
  hashOutput: string[];




  ngOnInit() {   
        this.source.pipe(
            map((rows: fmsItem[])=> 
              this.ToHash(rows)
            )
            
          )
          .subscribe((result) => {
            this.hashTable = result
            console.log(this.hashTable )
          });
  }

  private getSortedRows(data: fmsItem[]){
    return data.sort((a,b)=> a.code.localeCompare(b.code));
  }

  ToHash(rows: fmsItem[]): htHashTableI {
    const hashTable = {};

    return hashTable;
  }
  
}
