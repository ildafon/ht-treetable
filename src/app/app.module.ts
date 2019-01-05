import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

// import { TreeTableModule } from './tree-table/tree-table.module';
import { HierTableModule } from './hier-table/hier-table.module';
import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent,
    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    HierTableModule
    // TreeTableModule,
   
  ],
  
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
