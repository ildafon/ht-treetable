import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';


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
}
