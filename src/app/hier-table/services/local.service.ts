import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { htFmsItemI } from '../models/fms.model';

export interface dataApi {
  items: any[]
}



@Injectable()
export class LocalService {
  
  constructor(private http: HttpClient) { }


  getFMSData(): Observable<htFmsItemI[]> {
    const href = `/assets/fms.json`
    return this.http.get<htFmsItemI[]>(href);
  }

  getLazyData(id: string): Observable<htFmsItemI[]> {
    const href = `/assets/extend${id}.json`
    return this.http.get<htFmsItemI[]>(href);
  }
}
