import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge, BehaviorSubject } from 'rxjs';

import { htFmsItem, htHashTable, column  } from './models'
import { environment } from '../../environments/environment';
import { toHash } from './utils';
import { LocalService } from './services/local.service';


/**
 * Data source for the HierTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class HierTableDataSource extends DataSource<htFmsItem> {
  
  hashTable = new BehaviorSubject<htHashTable>({});
  rootRowIds: string[] = [];

  searchResultIds =  new BehaviorSubject<string[]>([]);

  searchText = new BehaviorSubject<string>("");
  get search(): string  { return this.searchText.value; }
  set search(search: string) { this.searchText.next(search) }

  expandedAll: boolean = false;
  columns: column[] = environment.columns;
  columnsToDisplay: string[];

  sourceRows: htFmsItem[];
  
  get data(): htFmsItem[]  { 
    const output = [];
    this.rootRowIds.forEach( id => this.getVisibleDescendantIds(output, id));
    return output.map( id => this.hashTable.value[id].row); 
  }
  
  constructor(
    private paginator: MatPaginator, 
    private sort: MatSort, 
    private source: Observable<htFmsItem[]>,
    private api: LocalService ) {
      super();
      this.initialize(this.source);
      this.columnsToDisplay = this.columns.map( column => column.name);
  }

  private initialize(source: Observable<htFmsItem[]>) {
    source
      .pipe(
          map((rows: htFmsItem[]) => {
            this.sourceRows = rows;
            return toHash(rows)
          }) 
      )
      .subscribe((result: htHashTable) => {
        this.rootRowIds = this.getRootRowIds(result); // getting root rows only once 
        this.hashTable.next(result);
      });    
  }

      
  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<htFmsItem[]> {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      this.hashTable,
      this.searchResultIds,
      this.paginator.page,
      this.sort.sortChange
    ];

    // Set the paginator's length
    this.paginator.length = this.data.length;

    return merge(...dataMutations).pipe(map(() => {
      return this.getPagedData(this.getSortedData(this.getSearchResult([...this.data])));
    }));
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {}


  private getRootRowIds(hashTable: htHashTable): string[] {
    return Object.keys(hashTable).filter( id => hashTable[id].parentId === null)
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
    if ($event.keyCode == 27 ) this.clearSearch();

    this.searchText.next($event.target.value);
    const ids = this.getSearchResultIds();
    this.searchResultIds.next(ids);
    this.showAllRows();  
  }

  public clearSearch() {
    this.search = '';
    this.collapseAll();
    this.searchResultIds.next([]);
    this.paginator.pageIndex = 0;
  }

  public onBlurSearch() {
    (this.search.length === 0 ) ? this.collapseAll() : null;
  }

  private getSearchResultIds() {
    const hashTable = this.hashTable.value;
    if (this.searchText.value.length === 0) return [];
    let result = new Set();
    const ids = Object.keys(hashTable);
    const columnsSearchIn = this.columns.map( col => col.name)
    ids.filter( id => {
        const cols = columnsSearchIn.reduce((acc,col) => acc + ' ' + (hashTable[id].row[col] ? hashTable[id].row[col] : ''),'');
        return (cols.toLocaleLowerCase().indexOf(this.searchText.value.toLocaleLowerCase()) > -1);  
    }).forEach( id => {     
      this.getAncestors(id).forEach(id => result.add(+id))
      result.add(+id);
    })
    return Array.from(result);
  }


  private getSearchResult(data: htFmsItem[]): htFmsItem[]{
    if (this.searchText.value.length === 0) return data; 
    return data.filter( (row: htFmsItem) => 
      this.searchResultIds.value.indexOf(row.id) > -1)
      .map(row => {
        if (row.hasChildren) row.open = true;
        return row;
      })   
  }

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: htFmsItem[]) {
    this.paginator.length = data.length;
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: htFmsItem[]) {
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

  toggle(rowId: string): void {
    if (this.search.length > 0) return;
    let ht = this.hashTable.value;
    
    if (ht[rowId].row.extend && !ht[rowId].row.open) this.extendRow(rowId);
    ht[rowId].row.extend = false;
    ht[rowId].row.open = !ht[rowId].row.open;
    this.hashTable.next(ht);
    
  }

  toggleAll(): void {
    if (this.search.length > 0) return;

    this.expandedAll ? this.collapseAll(): this.expandAll()
  }

  extendRow(rowId: string) {
    let ht = this.hashTable.value;
    ht[rowId].row.loading = true;
    this.hashTable.next(ht);
    
    // Demo delay 3s
    setTimeout(() => {
      const hashTable = this.hashTable.value;
      
      this.api.getLazyData(rowId).pipe(
        map((rows: htFmsItem[]) => {
          this.sourceRows = this.sourceRows.concat(rows.filter( row => {
            return this.sourceRows.findIndex(item => item.id === row.id) < 0
          }))             
          return toHash(this.sourceRows)
        })            
      )
      .subscribe( (result: htHashTable) => {
        this.hashTable.next(result);
      });
      
      let ht = this.hashTable.value;
      ht[rowId].row.loading = false;
      
      this.hashTable.next(ht)
    }, 3000);
    
  }

  
  public  hideAllRows() {
    const hashTable = this.hashTable.value;
    const ids = Object.keys(hashTable);
    ids.forEach( id => {
      const row = hashTable[id].row;
        row.hidden = true
        row.hasChildren ? row.open = true : null
    });
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
    this.expandedAll = true;
  }

  public collapseAll() {
    const hashTable = this.hashTable.value;
    const ids = Object.keys(hashTable);
    ids.forEach( id => {
      const row = hashTable[id].row;
        row.hidden = false;
        (row.hasChildren || row.extend) ? row.open = false : null
    })
    this.hashTable.next(hashTable);
    this.expandedAll = false;
    
  }

}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
