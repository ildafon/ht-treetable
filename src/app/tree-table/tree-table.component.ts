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


export class TreeItemNode {
  id: string;
  expanded!: boolean;
  isExpandable!: boolean
  item: string;
  code: string;
  level: number;
  children!: TreeItemNode[];  
}


@Component({
  selector: 'ht-tree-table',
  templateUrl: './tree-table.component.html',
  styleUrls: ['./tree-table.component.scss'],
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
export class TreeTableComponent implements OnInit {
  
  @Input() dataSource: Observable<dataApi>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  
  columnsToDisplay: string[] = ['code', 'extend', 'text'];
  itemsToSearchWithin = ['code','item'];

  data: TreeItemNode[];
  
  resultsLength = 0;
  isLoadingResults = true;

  
  sourceRowsSubject = new BehaviorSubject<TreeItemNode[]>([]);
  get sourceRows(): TreeItemNode[]  { return this.sourceRowsSubject.value; }
  sourceRowsObservable = this.sourceRowsSubject.asObservable();

  filterTextSubject = new BehaviorSubject<string>("");
  get filterText(): string  { return this.filterTextSubject.value; }
  fiterTextObservable = this.filterTextSubject.asObservable();

  constructor(private dataService: LocalService){}
    
  ngOnInit() {   
    
    this.dataSource
    .pipe(
      map(result => {
        return this.inputTreeToSourceRows(result.items)
      }),
      catchError(() => {
        return observableOf([]);
      })
    )
    .subscribe((items) => {
      this.isLoadingResults = false;
      this.sourceRowsSubject.next(items);
      
      this.initialize();
    });    
  }

  initialize(){
    
    this.isLoadingResults = true;

    merge(
      this.sourceRowsObservable,
      this.fiterTextObservable,
      this.paginator.page)
    .pipe( 
      switchMap(() => {
        return this.sourceRowsObservable
      }),
      map((rows)=>{
        return this.getFilteredData(rows);
      }),
      map((rows) => {  
        // console.log('rows', rows);
        return this.sourceRowsToTree(rows, '0')  
      }),
      map((sourceTree) => {  
        // console.log('sourceTree', sourceTree);
        return this.treeToTable(sourceTree)  
      }),
      map((tableRows) => { 
        this.resultsLength = tableRows.length;
        return this.getPagedData(tableRows)  
      }),
      catchError(() => {
        this.isLoadingResults = false;
        return observableOf([]);
      })
    ).subscribe( rowsToDisplay => { 
        this.data = rowsToDisplay;
        this.isLoadingResults = false;
        
      });
  };

  
   


  private inputTreeToSourceRows(tree, rows = []) {
    if (!tree.length) return tree;
    return tree.reduce(
      (acc, node) => {
        const treeNode = new TreeItemNode();
        treeNode.id = uuid();
        treeNode.item = node.item;
        treeNode.code = node.code;
        treeNode.level = node.code.match(/\./g).length;

        if (node.children && node.children.length > 0) {  
          treeNode.isExpandable = true;
          treeNode.expanded = false;
          acc.push(treeNode);
          this.inputTreeToSourceRows(node.children, rows);
        } else {
          acc.push(treeNode);
        }
        
        return acc;
      },
      rows
    );
  };
  
  private sourceRowsToTree(obj: TreeItemNode[], level: string): TreeItemNode[] {
    return obj.filter(o =>
      (<string>o.code).startsWith(level + '.')
      && (o.code.match(/\./g) || []).length === (level.match(/\./g) || []).length + 1
    )
      .map(o => {
          const node = new TreeItemNode();
          node.id = o.id,
          node.item = o.item,
          node.code = o.code,
          node.level = o.level,
          node.isExpandable = o.isExpandable,
          node.expanded = o.expanded
          if (o.expanded) {
            
            const children = obj.filter(so => (<string>so.code).startsWith(level + '.'));
            if (children && children.length > 0) {
              
              node.children = this.sourceRowsToTree(children, o.code);
            }
          }
           
               
        return node;
      });
  }

  private treeToTable(tree, rows = []) {
    if (!tree.length) return tree;
    return tree.reduce(
      (acc, node) => {
        if (node.isExpandable) {
          acc.push({
            id: node.id, 
            text: node.item, 
            code: node.code, 
            isExpandable: node.isExpandable, 
            expanded: node.expanded, 
            level: node.level});
            if (node.expanded){
              this.treeToTable(node.children, rows);
            }
            
        } else {
          acc.push({
            id: node.id, 
            text: node.item, 
            code: node.code, 
            level: node.level});
        }
        return acc;
      },
      rows,
    );
  };


  private getPagedData(data: TreeItemNode[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }




  private getFilteredData(data: TreeItemNode[]) {
    if (!this.filterText) {
      return data
    } 

    let filteredData = data.filter(d => {      
        const cols = this.itemsToSearchWithin.reduce((acc,col)=> acc + d[col],''); 
        if (cols.toLocaleLowerCase().indexOf(this.filterText.toLocaleLowerCase()) > -1){
          return d;
        }
      })
      .map(d => {
        if (d.isExpandable) d.expanded=true
        return d;
      });
      
    
    Object.assign([], filteredData).forEach(ftd => {
      let str = (<string>ftd.code);
      
      while (str.lastIndexOf('.') > -1) {
        const index = str.lastIndexOf('.');
        str = str.substring(0, index);
        if (filteredData.findIndex(t => t.code === str) === -1) {
          const obj = Object.assign({}, data.find(d => d.code === str));
          if (obj&&obj.id) {
            obj.expanded = true;
            filteredData.push(obj);
            
          }
        }
      }
    });
     
    return filteredData;  
  }





  expandClick(row) {
    const toChenge = this.sourceRows;
    const indexToExpand = toChenge.findIndex(x => x.id === row.id);
    let expandedProp = toChenge[indexToExpand].expanded;
    toChenge[indexToExpand].expanded = !expandedProp
    this.sourceRowsSubject.next(toChenge);
    
  }
  
  getPartial(id: string, row){
    this.isLoadingResults = true;
    this.dataService.getPartialData(id)
    .pipe(
      map(result => {
        return this.inputTreeToSourceRows(result.items)
      }),
      catchError(() => {
        return observableOf([]);
      })
    )
    .subscribe(rows => {
      
      this.isLoadingResults = false;
            
      const toChange = this.sourceRows;
      const indexToExpand = toChange.findIndex(x => x.id === row.id);
      let expandedProp = toChange[indexToExpand].expanded;
      toChange[indexToExpand].expanded = !expandedProp

      this.sourceRowsSubject.next([...toChange, ...rows]);
    });
    
    
  }


  isExpand(index, item): boolean{
    return item.isExpandable;
  }

  filterChanged(filterText: string) {
    this.isLoadingResults = true;
    this.filterTextSubject.next(filterText); 
  }

}
