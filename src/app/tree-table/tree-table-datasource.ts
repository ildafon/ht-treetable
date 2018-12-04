import { DataSource } from '@angular/cdk/collections';
import {Observable, of as observableOf, merge} from 'rxjs';
import { map } from 'rxjs/operators';
import { MatPaginator, MatSort } from '@angular/material';

export interface TableItem {
    name: string;
    id: number;
  }
  

export class TreeTableDatasource extends DataSource<TableItem> {
    data: TableItem[];

    filter: string;

    constructor(private inputData, public paginator: MatPaginator, private sort: MatSort, public columnsToDisplay: string[]){
        super();  
        console.log(inputData)
        this.data = inputData;         
    } 

    connect(): Observable<TableItem[]>{
        const dataMutations = [
            observableOf(this.data),
            this.paginator.page,
            this.sort.sortChange
        ];

        this.columnsToDisplay = Object.keys(this.data[0]);
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
