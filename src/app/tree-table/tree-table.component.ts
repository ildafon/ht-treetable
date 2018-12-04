import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

import { MatPaginator, MatSort} from '@angular/material';
import {merge, Observable, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';

import { LocalService} from '../services/local.service';
import { RemoteService} from '../services/remote.service';




export class TreeItemNode {
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
  providers: [ 
    {provide: LocalService, useClass: LocalService},
  ]
})
export class TreeTableComponent implements OnInit {
  
  columnsToDisplay: string[] = ['code', 'text'];
  sourceRows: TreeItemNode[] = [];
  
  data: TreeItemNode[];
  
  resultsLength = 0;
  isLoadingResults = true;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private dataService: LocalService) {
    this.initialize()
  }

  initialize(){
    this.dataService.getData()
    .pipe(
      map( data => {
        this.isLoadingResults = false;
        return this.getSourceRows(data.items);
      })
    )
    .subscribe(data => this.sourceRows = data);
  }
  
  ngOnInit() {   
    // this.tree = this.rowToTree(TREE_DATA, '0');
    // this.data = this.treeToRows(this.tree);
    // this.sourceRows = this.getSourceRows(TREE_DATA2);

    
   
    merge( observableOf(this.sourceRows),this.sort.sortChange, this.paginator.page)
    .pipe(
      
      map(() => {  
        return this.transorm(this.rowsToTree([...this.sourceRows], '0'))  
      }),
      catchError(() => {
        this.isLoadingResults = false;
        return observableOf([]);
      })
    ).subscribe(data => { 
        this.data = data;
        this.resultsLength = data.length;
      });



  }


  getSourceRows(tree, rows = []) {
    if (!tree.length) return tree;
    return tree.reduce(
      (acc, node) => {
        if (node.children) {
          const treeNode = new TreeItemNode();
          treeNode.item = node.item;
          treeNode.code = node.code;
          treeNode.level = node.code.match(/\./g).length;
          treeNode.expanded = false;
          treeNode.isExpandable = true;
          acc.push(treeNode);
          this.getSourceRows(node.children, rows);
        } else {
          const treeNode = new TreeItemNode();
          treeNode.item = node.item;
          treeNode.code = node.code;
          acc.push(treeNode);
        }
        return acc;
      },
      rows,
    );
  };
  
  public filter(filterText: string) {
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
            }
          }
        }
      });
    } else {
      filteredTreeData = this.sourceRows;
    }

    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    // file node as children.
    const data = this.rowsToTree(filteredTreeData, '0');
    // Notify the change.
    this.data = data;
  }


  rowsToTree(obj: TreeItemNode[], level: string): TreeItemNode[] {
    return obj.filter(o =>
      (<string>o.code).startsWith(level + '.')
      && (o.code.match(/\./g) || []).length === (level.match(/\./g) || []).length + 1
    )
      .map(node => {
        
          const children = obj.filter(so => (<string>so.code).startsWith(level + '.'));
          if (children && children.length > 0) {
            
            node.children = this.rowsToTree(children, node.code);
          } else {
            // async extention 
          }
        
               
        return node;
      });
  }

  transorm(tree, rows = []) {
    if (!tree.length) return tree;
    return tree.reduce(
      (acc, node) => {
        if (node.children && node.children.length > 0) {
          acc.push({text: node.item, code: node.code, isExpandable: node.isExpandable, expanded: node.expanded, level: node.level});
          if (node.expanded) {
            this.transorm(node.children, rows);
          } 
            
        } else {
          acc.push({text: node.item, code: node.code, level: node.level});
        }
        return acc;
      },
      rows,
    );
  };

  expandClick(row) {
    console.log('click', row);
    this.sourceRows.filter( (node: TreeItemNode) => node.item == row.text)
    .map(row => {

      console.log(row);
      return row.expanded = !row.expanded;
    } );
    
    
    // this.data = this.treeToRows(this.tree);  // hack to trigger filter refresh
  }  

  isExpand(index, item): boolean{
    console.log(item)
    return item.isExpandable;
  }

  filterChanged(filterText: string) {
    this.filter(filterText);
    
  }
}



