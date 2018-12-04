import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

import { MatPaginator, MatSort} from '@angular/material';
import {merge, Observable, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';

import { LocalService} from '../services/local.service';
import { RemoteService} from '../services/remote.service';




export class TreeItemNode {
  expanded: boolean;
  item: string;
  code: string;
  level: number;
  children: TreeItemNode[];  
}


const TREE_DATA = [
  { 'text': 'Turkiye', 'code': '0.1' },
  { 'text': 'İstanbul', 'code': '0.1.1' },
  { 'text': 'Beykoz', 'code': '0.1.1.1' },
  { 'text': 'Fatih', 'code': '0.1.1.1' },
  { 'text': 'Ankara', 'code': '0.1.2' },
  { 'text': 'Cankaya', 'code': '0.1.2.1' },
  { 'text': 'Etimesgut', 'code': '0.1.2.1' },
  { 'text': 'Elazig', 'code': '0.1.3' },
  { 'text': 'Palu', 'code': '0.1.3.1' },
  { 'text': 'Baskil', 'code': '0.1.3.2' },
  { 'text': 'Sivrice', 'code': '0.1.3.3' }
];

const TREE_DATA2 = [
  {
  "item": "Turkiye",
  "code": "0.1",
  "children": [{
      "item": "İstanbul",
      "code": "0.1.1",
      "children": [{
          "item": "Beykoz",
          "code": "0.1.1.1",
          "children": []
      }, {
          "item": "Fatih",
          "code": "0.1.1.1",
          "children": []
      }]
  }, {
      "item": "Ankara",
      "code": "0.1.2",
      "children": [{
          "item": "Cankaya",
          "code": "0.1.2.1",
          "children": []
      }, {
          "item": "Etimesgut",
          "code": "0.1.2.1",
          "children": []
      }]
  }, {
      "item": "Elazig",
      "code": "0.1.3",
      "children": [{
          "item": "Palu",
          "code": "0.1.3.1",
          "children": []
      }, {
          "item": "Baskil",
          "code": "0.1.3.2",
          "children": []
      }, {
          "item": "Sivrice",
          "code": "0.1.3.3",
          "children": []
      }]
  }]
}]


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
  sourceRows = [];
  tree: TreeItemNode[];
  data: any[];
  
  resultsLength = 0;
  isLoadingResults = true;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private dataService: LocalService) {}
  
  ngOnInit() {   
    // this.tree = this.rowToTree(TREE_DATA, '0');
    // this.data = this.treeToRows(this.tree);
    // this.sourceRows = this.getSourceRows(TREE_DATA2);

    this.dataService.getData()
    .pipe(
      map( data => {
        this.isLoadingResults = false;
        return this.getSourceRows(data.items);
      })
    )
    .subscribe(data => this.sourceRows = data);
   
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
  


  rowsToTree(obj: TreeItemNode[], level: string): TreeItemNode[] {
    return obj.filter(o =>
      (<string>o.code).startsWith(level + '.')
      && (o.code.match(/\./g) || []).length === (level.match(/\./g) || []).length + 1
    )
      .map(node => {
        if (node.expanded) {
          const children = obj.filter(so => (<string>so.code).startsWith(level + '.'));
          if (children && children.length > 0) {
            node.children = this.rowsToTree(children, node.code);
          } else {
            // async extention 
          }
        }
               
        return node;
      });
  }

  transorm(tree, rows = []) {
    if (!tree.length) return tree;
    return tree.reduce(
      (acc, node) => {
        if (node.children && node.children.length > 0) {
          acc.push({text: node.item, code: node.code, exp: true});
          if (node.expanded) {
            this.transorm(node.children, rows);
          } 
            
        } else {
          acc.push({text: node.item, code: node.code});
        }
        return acc;
      },
      rows,
    );
  };

  expandClick(row) {
    console.log(row);
    row.expanded = !row.expanded
    // this.data = this.treeToRows(this.tree);  // hack to trigger filter refresh
  }  

isExpand(index, item): boolean{
  return Object.keys(item).indexOf('expanded') > -1;
}


}
