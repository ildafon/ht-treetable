import { v4 as uuid } from 'uuid';

import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

import { MatPaginator, MatSort, MatTable} from '@angular/material';
import {merge, Observable, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';

import {dataApi} from '../services/local.service';




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
    trigger('rowExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({ height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
 
})
export class TreeTableComponent implements OnInit {
  
  @Input() dataSource: Observable<dataApi>;

  columnsToDisplay: string[] = ['code', 'text'];
  sourceRows: TreeItemNode[];
  
  data: TreeItemNode[];
  
  resultsLength = 0;
  isLoadingResults = true;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<TreeItemNode[]>;

  constructor() { 
    
  }

  
  ngOnInit() {   
    
    this.dataSource
    .pipe(
      map(result => {
        console.log(' result', result);
        return this.inputTreeToSourceRows(result.items)
      }),
      catchError(() => {
        return observableOf([]);
      })
    )
    .subscribe(items => this.sourceRows = items)
    


    // merge( this.sort.sortChange, this.paginator.page)
    // .pipe(
     
    //   switchMap(() => {  
    //     return this.sourceRowsToTree(this.sourceRows, '0')  
    //   }),
    //   map((sourceTree) => {  
    //     console.log('sorceTree', sourceTree);
    //     return this.treeToTable(sourceTree)  
    //   }),
    //   catchError(() => {
    //     this.isLoadingResults = false;
    //     return observableOf([]);
    //   })
    // ).subscribe( rowsToDisplay => { 
    //   console.log('rowsToDisplay', rowsToDisplay );
    //     this.data = rowsToDisplay;
    //     this.resultsLength = this.data.length;
    //   });
  }


  inputTreeToSourceRows(tree, rows = []) {
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
      rows,
    );
  };
  
  filter(filterText: string) {
    let filteredTreeData;
    if (filterText) {
      
      filteredTreeData = this.sourceRows.filter(d => d.item.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1);
      
      Object.assign([], filteredTreeData).forEach(ftd => {
        let str = (<string>ftd.code);
        
        while (str.lastIndexOf('.') > -1) {
          const index = str.lastIndexOf('.');
          str = str.substring(0, index);
          if (filteredTreeData.findIndex(t => t.code === str) === -1) {
            const obj = this.sourceRows.find(d => d.code === str);
            if (obj) {
              filteredTreeData.push(obj);
              console.log('filteredTreeData', filteredTreeData)
            }
          }
        }
      });
    } else {
      filteredTreeData = this.sourceRows;
    }

    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    // file node as children.
    // const data = this.rowsToTree(filteredTreeData, '0');
    // // Notify the change.
    // this.data = data;
    // this.table.renderRows();
    }


  sourceRowsToTree(obj: TreeItemNode[], level: string): TreeItemNode[] {
    return obj.filter(o =>
      (<string>o.code).startsWith(level + '.')
      && (o.code.match(/\./g) || []).length === (level.match(/\./g) || []).length + 1
    )
      .map(node => {
        
          const children = obj.filter(so => (<string>so.code).startsWith(level + '.'));
          if (children && children.length > 0) {
            
            node.children = this.sourceRowsToTree(children, node.code);
          } else {
            // async extention 
          }
        
               
        return node;
      });
  }

  treeToTable(tree, rows = []) {
    if (!tree.length) return tree;
    return tree.reduce(
      (acc, node) => {
        if (node.children && node.children.length > 0) {
          acc.push({
            id: node.id, 
            text: node.item, 
            code: node.code, 
            isExpandable: node.isExpandable, 
            expanded: node.expanded, 
            level: node.level});
            this.treeToTable(node.children, rows);
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

  expandClick(row) {
    console.log('before expand this.sourceRows', this.sourceRows);
    const rowToExpand = this.sourceRows.findIndex(x => x.id === row.id);
    
    // this.sourceRows[rowToExpand].expanded = true;
    console.log('after expand this.sourceRows', this.sourceRows);
    console.log('rowToExpand', rowToExpand);
    // this.sourceRows.filter( (node: TreeItemNode) => node.item == row.text)
    // .map(row => {
    //   return row.expanded = !row.expanded;
    // } );
    
    // this.table.renderRows();
    // this.data = this.treeToRows(this.tree);  // hack to trigger filter refresh
  }  

  isExpand(index, item): boolean{
    
    return item.isExpandable;
  }

  filterChanged(filterText: string) {
    this.filter(filterText);
    
  }
}



