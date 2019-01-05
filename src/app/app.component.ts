import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { dataApi } from './services/local.service';
import { LocalService } from './services/local.service';
import { RemoteService } from './services/remote.service';
import { fmsItem } from './models/fms.model';


@Component({
  selector: 'ht-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ 
    {provide: LocalService, useClass: LocalService},
  ]
})
export class AppComponent implements OnInit{
  data: Observable<fmsItem[]>;
  
  constructor(private dataService: LocalService) {}

  ngOnInit() {
    this.data = this.dataService.getFMSData()
  }
}
