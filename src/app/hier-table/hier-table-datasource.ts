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
  searchText = new BehaviorSubject<string>("");
  get search(): string  { return this.searchText.value; }
  set search(search: string) { this.searchText.next(search) }
  // search: string = '';

  searchResultIds =  new BehaviorSubject<string[]>([]);
  // searchResultIds = [];

  get data(): htFmsItemI[]  { 
    const rootIds = this.getRootRowIds();
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
      this.searchResultIds,
      // this.searchText,
      this.paginator.page,
      this.sort.sortChange
    ];

    // Set the paginator's length
    // console.log('in connect', this.data.length);
    this.paginator.length = this.data.length;

    return merge(...dataMutations).pipe(map(() => {
      // console.log('in connect Fired');
      return this.getPagedData(this.getSortedData(this.getSearchResult([...this.data])));
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

  private getRootRowIds(): string[] {
    return Object.keys(this.hashTable.value).filter( id => this.hashTable.value[id].parentId === null)
  }

  private getVisibleDescendantIds(descendantIds: string[], rowId: string): void {
    const row = this.hashTable.value[rowId].row;
    if (!row.hidden) {
      descendantIds.push(rowId);
    }
    if ( row.hasChildren && row.open) {
      this.hashTable.value[rowId].childrenIds.forEach( (childId: string) => 
        this.getVisibleDescendantIds(descendantIds, childId))
    }
  }

  
  private isVisible(rowId) {
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

  public  showAllRows() {
    const hashTable = this.hashTable.value;
    const ids = Object.keys(hashTable);
    ids.forEach( id => hashTable[id].row.hidden = false);
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
    return ancestors;
  }


  public searchChanged($event) {
    if ($event.keyCode == 27 ) {
      this.collapseAll();
      this.paginator.pageIndex = 0;
      this.clearSearch();
      this.search = '';
    }
    this.searchText.next($event.target.value);
    const ids = this.getSearchResultIds();
    this.searchResultIds.next(ids);
    this.showAllRows();
    console.log('searchChanged ids', this.searchResultIds.value); 
    
    
  }

  public clearSearch() {
    this.searchText.next('');
    this.searchResultIds.next([]);
  }

  public getSearchText() {
    return this.searchText.value;
    // return this.searchText;
  }

  private getSearchResultIds() {
    const hashTable = this.hashTable.value;
    if (this.searchText.value.length === 0) return [];
    // if (this.searchText.length === 0) return [];
    let result = new Set();
    const ids = Object.keys(hashTable);
    const columnsSearchIn = this.columns.map( col => col.name)
    ids.filter( id => {
        const cols = columnsSearchIn.reduce((acc,col) => acc + ' ' + (hashTable[id].row[col] ? hashTable[id].row[col] : ''),'');
        console.log('in getSearchResultIds, cols ', cols);
          return (cols.toLocaleLowerCase().indexOf(this.searchText.value.toLocaleLowerCase()) > -1);  
          // return (cols.toLocaleLowerCase().indexOf(this.searchText.toLocaleLowerCase()) > -1);  
    }).forEach( id => {     
      this.getAncestors(id).forEach(id => result.add(+id))
      result.add(+id);
    })
    return Array.from(result);
  }


  private getSearchResult(data: htFmsItemI[]): htFmsItemI[]{
    if (this.searchText.value.length === 0) return data; 
    // if (this.searchText.length === 0) return data; 

    return data.filter( (row: htFmsItemI) => 
      this.searchResultIds.value.indexOf(row.id) > -1)
      // this.searchResultIds.indexOf(row.id) > -1)
      .map(row => {
        if (row.hasChildren) row.open = true;
        return row;
      })   
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

  ping() {
    console.log('ping');
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
