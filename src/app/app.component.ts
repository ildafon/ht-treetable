import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TableItem } from './tree-table/tree-table-datasource';
import { LocalService } from './services/local.service';
import { RemoteService } from './services/remote.service';

@Component({
  selector: 'ht-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{
}
