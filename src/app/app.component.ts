import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { dataApi } from './services/local.service';
import { LocalService } from './services/local.service';
import { RemoteService } from './services/remote.service';


@Component({
  selector: 'ht-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ 
    {provide: LocalService, useClass: LocalService},
  ]
})
export class AppComponent{
  gettedTree: Observable<dataApi>;

  constructor(private dataService: LocalService) { 
    
    this.gettedTree = this.dataService.getData()
  }
}
