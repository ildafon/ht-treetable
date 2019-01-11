import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { htFmsItem } from '../models/fms.model';

export interface dataApi {
  items: any[]
}



@Injectable()
export class LocalService {
  
  constructor(private http: HttpClient) { }


  getFMSData(): Observable<htFmsItem[]> {
    const href = `/assets/fms.json`
    return this.http.get<htFmsItem[]>(href);
  }

  getLazyData(id: string): Observable<htFmsItem[]> {
    const href = `/assets/extend${id}.json`
    return this.http.get<htFmsItem[]>(href);
  }
}
