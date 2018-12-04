import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

import { MatPaginator, MatSort} from '@angular/material';
import { Observable } from 'rxjs';
import { LocalService} from '../services/local.service';
import { RemoteService} from '../services/remote.service';




export class TreeItemNode {
  node_check: boolean;
  item: string;
  code: string;
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
  tree: TreeItemNode[];
  data: any[];
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private dataService: LocalService) {}
  

  ngOnInit() {   
    this.tree = this.rowToTree(TREE_DATA, '0');
    this.data = this.treeToRows(this.tree);
  }


  
  rowToTree(obj: any[], level: string): TreeItemNode[] {
    return obj.filter(o =>
      (<string>o.code).startsWith(level + '.')
      && (o.code.match(/\./g) || []).length === (level.match(/\./g) || []).length + 1
    )
      .map(o => {
        const node = new TreeItemNode();
        node.item = o.text;
        node.code = o.code;
        node.node_check = false;
        const children = obj.filter(so => (<string>so.code).startsWith(level + '.'));
        if (children && children.length > 0) {
          node.children = this.rowToTree(children, o.code);
        }
        return node;
      });
  }

  treeToRows(tree, rows = []) {
    if (!tree.length) return tree;
    return tree.reduce(
      (acc, node) => {
        if (node.children && node.children.length > 0) {
          acc.push({text: node.item, code: node.code, exp: true});
          if (node.node_check) {
            this.treeToRows(node.children, rows);
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
    row.exp = !row.exp
    this.data = this.treeToRows(this.tree);  // hack to trigger filter refresh
  }  

isExpand(index, item): boolean{
  return item.exp;
}


}
