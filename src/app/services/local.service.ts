import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { fmsItem } from '../models/fms.model';

export interface dataApi {
  items: any[]
}



@Injectable()
export class LocalService {
  
  constructor(private http: HttpClient) { }

  getData(): Observable<dataApi> {
    const href = '/assets/example-data.json'
    return this.http.get<dataApi>(href);
  }

  getPartialData(id: string): Observable<dataApi> {
    const href = `/assets/example-data${id}.json`
    return this.http.get<dataApi>(href);
  }


  getFMSData(): Observable<fmsItem[]> {
    const href = `/assets/fms.json`
    return this.http.get<fmsItem[]>(href);
  }
}
