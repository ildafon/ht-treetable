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
import { htFmsItemI, htHashItemC, htHashTableI } from '../models';
import { ToHash } from '../utils';





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
  @ViewChild(MatPaginator) paginator: MatPaginator;
  
  output: htFmsItemI[];
  hashTable: htHashTableI;
  hashOutput: string[];

  subscription: Subscription;


  ngOnInit() {   
      this.subscription = this.source
      .pipe(
          map((rows: htFmsItemI[]) => 
            ToHash(rows)
          )      
      )
      .subscribe((result) => {
        this.hashTable = result;
        console.log(result); 
      });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  
  
}



