import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { dataApi } from './hier-table/services/local.service';
import { LocalService } from './hier-table/services/local.service';
import { RemoteService } from './hier-table/services/remote.service';
import { htFmsItem } from './hier-table/models';




@Component({
  selector: 'ht-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ 
    {provide: LocalService, useClass: LocalService},
  ]
})
export class AppComponent implements OnInit{
  data: Observable<htFmsItem[]>;
  
  constructor(private dataService: LocalService) {}

  ngOnInit() {
    this.data = this.dataService.getFMSData()
  }
}
