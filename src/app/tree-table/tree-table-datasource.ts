import { DataSource } from '@angular/cdk/collections';
import {Observable, of as observableOf, merge} from 'rxjs';
import { map } from 'rxjs/operators';
import { MatPaginator, MatSort } from '@angular/material';


export interface TableItem {
    name: string;
    id: number;
  }
  

export class TreeTableDatasource extends DataSource<TableItem> {
    data: TableItem[] = [];

    filter: string;

    constructor(public paginator: MatPaginator, private sort: MatSort){
        super();        
    } 

    connect(): Observable<TableItem[]>{
        const dataMutations = [
            this.paginator.page,
            this.sort.sortChange
        ];

        
        this.paginator.length = this.data.length;

        return merge(...dataMutations)
        .pipe(map( () => {
            return this.getPagedData([...this.data]);
        }));
    }

    disconnect(){}

    private getPagedData(data: TableItem[]) {
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        return data.splice(startIndex, this.paginator.pageSize);
    }
}
