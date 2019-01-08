import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge, BehaviorSubject } from 'rxjs';

import { htFmsItemI, column, htHashTableI } from '../models'

import { environment } from '../../environments/environment';
import { toHash } from '../utils';




// TODO: Replace this with your own data model type
export interface HierTableItem {
  name: string;
  id: number;
}

// TODO: replace this with real data from your application
export const EXAMPLE_DATA: HierTableItem[] = [
  {id: 1, name: 'Hydrogen'},
  {id: 2, name: 'Helium'},
  {id: 3, name: 'Lithium'},
  {id: 4, name: 'Beryllium'},
  {id: 5, name: 'Boron'},
  {id: 6, name: 'Carbon'},
  {id: 7, name: 'Nitrogen'},
  {id: 8, name: 'Oxygen'},
  {id: 9, name: 'Fluorine'},
  {id: 10, name: 'Neon'},
  {id: 11, name: 'Sodium'},
  {id: 12, name: 'Magnesium'},
  {id: 13, name: 'Aluminum'},
  {id: 14, name: 'Silicon'},
  {id: 15, name: 'Phosphorus'},
  {id: 16, name: 'Sulfur'},
  {id: 17, name: 'Chlorine'},
  {id: 18, name: 'Argon'},
  {id: 19, name: 'Potassium'},
  {id: 20, name: 'Calcium'},
];

/**
 * Data source for the HierTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class HierTableDataSource extends DataSource<htFmsItemI> {
  // data: HierTableItem[] = EXAMPLE_DATA;
  columns: column[] = environment.columns; 
 

  entities = new BehaviorSubject<htHashTableI>({});
  ids = new BehaviorSubject<string[]>([]);
  output = new BehaviorSubject<string[]>([]);
  get data(): htFmsItemI[]  { 
    const ids = Object.keys(this.entities.value);
    const rootIds = this.getRootRowIds(ids);
    const output = [];
    rootIds.forEach( id => this.getDescendantIds(output, id));
    return output.map( id => this.entities.value[id].row); 
  }

  constructor(private paginator: MatPaginator, private sort: MatSort, private source: Observable<htFmsItemI[]> ) {
    super();
    this.initialize();
  }


  private initialize() {
    this.source
      .pipe(
          map((rows: htFmsItemI[]) => 
            toHash(rows))            
      )
      .subscribe((result: htHashTableI) => {
        this.entities.next(result);
      });
    
  }

  

  private getRootRowIds(ids: string[] = []): string[] {
    return ids.filter( id => 
      (this.entities.value[id].parentId === null)
      && (!this.entities.value[id].row.hidden) );
  }

  private getDescendantIds(descendantIds: string[], rowId: string): void {
    descendantIds.push(rowId);
    if (this.isOpen(rowId)) {
      (<htHashTableI>this.entities.value)[rowId].childrenIds.forEach( (childId: string) => 
        this.getDescendantIds(descendantIds, childId));
    }
  }

  private isOpen(rowId) {
    return this.entities.value[rowId].row.open;
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
      this.entities,
      this.paginator.page,
      this.sort.sortChange
    ];

    // Set the paginator's length
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

  toggle(rowId: string) {
      const entities = this.entities.value;
      const open = entities[rowId].row.open
      entities[rowId].row.open = !open;
      this.entities.next(entities);
    }

    getColumns(): column[] {
      return this.columns;
    }

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: htFmsItemI[]) {
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
        default: return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
