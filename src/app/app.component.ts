import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { dataApi } from './services/local.service';
import { LocalService } from './services/local.service';
import { RemoteService } from './services/remote.service';
import { htFmsItemI,  column } from './models';

import { environment } from '../environments/environment';


@Component({
  selector: 'ht-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ 
    {provide: LocalService, useClass: LocalService},
  ]
})
export class AppComponent implements OnInit{
  data: Observable<htFmsItemI[]>;
  columns: column[] = environment.columns;
  
  constructor(private dataService: LocalService) {}

  ngOnInit() {
    this.data = this.dataService.getFMSData()
  }
}
