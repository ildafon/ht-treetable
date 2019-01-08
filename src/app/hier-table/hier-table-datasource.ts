import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge, BehaviorSubject } from 'rxjs';

import { htFmsItemI, column, htHashTableI } from '../models'

import { environment } from '../../environments/environment';
import { toHash } from '../utils';


/**
 * Data source for the HierTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class HierTableDataSource extends DataSource<htFmsItemI> {
  
  columns: column[] = environment.columns; 
  hashTable = new BehaviorSubject<htHashTableI>({});
  
  get data(): htFmsItemI[]  { 
    const ids = Object.keys(this.hashTable.value);
    const rootIds = this.getRootRowIds(ids);
    const output = [];
    rootIds.forEach( id => this.getVisibleDescendantIds(output, id));
    return output.map( id => this.hashTable.value[id].row); 
  }

  constructor(private paginator: MatPaginator, private sort: MatSort, private source: Observable<htFmsItemI[]> ) {
    super();
    this.initialize();
  }

      
  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<htFmsItemI[]> {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      this.hashTable,
      this.paginator.page,
      this.sort.sortChange
    ];

    // Set the paginator's length
    console.log('in connect', this.data.length);
    this.paginator.length = this.data.length;

    return merge(...dataMutations).pipe(map(() => {
      return this.getPagedData(this.getSortedData([...this.data]));
    }));
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {}


  private initialize() {
    this.source
      .pipe(
          map((rows: htFmsItemI[]) => 
            toHash(rows))            
      )
      .subscribe((result: htHashTableI) => {
        this.hashTable.next(result);
      });    
  }

  private getRootRowIds(ids: string[] = []): string[] {
    return ids.filter( id => 
      (this.hashTable.value[id].parentId === null)
      && (!this.hashTable.value[id].row.hidden) );
  }

  private getVisibleDescendantIds(descendantIds: string[], rowId: string): void {
    if (this.isVisible(rowId)) {
      descendantIds.push(rowId);
    }
    if ( this.hasChildren(rowId) && this.isOpen(rowId)) {
      (<htHashTableI>this.hashTable.value)[rowId].childrenIds.forEach( (childId: string) => 
        this.getVisibleDescendantIds(descendantIds, childId));
    }
  }

  private isVisible(rowId){
    return !this.hashTable.value[rowId].row.hidden;
  }

  private isOpen(rowId) {
    return this.hashTable.value[rowId].row.open;
  }

  private hasChildren(rowId) {
    return this.hashTable.value[rowId].row.hasChildren;
  }

  public  hideAllRows() {
    const hashTable = this.hashTable.value;
    const ids = Object.keys(hashTable);
    ids.forEach( id => hashTable[id].row.hidden = true);
    this.hashTable.next(hashTable);
  }

  public  expandAll() {
    const hashTable = this.hashTable.value;
    const ids = Object.keys(hashTable);
    ids.forEach( id => {
      const row = hashTable[id].row;
        row.hidden = false
        row.hasChildren ? row.open = true : null
    })
    this.hashTable.next(hashTable);
  }

  public collapseAll() {
    const hashTable = this.hashTable.value;
    const ids = Object.keys(hashTable);
    ids.forEach( id => {
      const row = hashTable[id].row;
        row.hidden = false
        row.hasChildren ? row.open = false : null
    })
    this.hashTable.next(hashTable);
  }

  public getAncestors(rowId: string) {
    const hashTable = this.hashTable.value;
    const ancestors = [];
    if (hashTable[rowId]) {
      let parentId = hashTable[rowId].parentId;
      while (parentId) {
        if (parentId) ancestors.push(parentId);
        parentId = hashTable[parentId].parentId;
      }
    }
     console.log('in getAncestor', ancestors);
    return ancestors;
  }

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: htFmsItemI[]) {
    this.paginator.length = data.length;
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: htFmsItemI[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'code': return compare(a.code, b.code, isAsc);
        case 'text': return compare(a.text, b.text, isAsc);
        case 'criterion': return compare(a.criterion, b.criterion, isAsc);
        default: return 0;
      }
    });
  }


  toggle(rowId: string) {
    const hashTable = this.hashTable.value;
    const open = hashTable[rowId].row.open
    hashTable[rowId].row.open = !open;
    this.hashTable.next(hashTable);
  }

  getColumns(): column[] {
    return this.columns;
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
