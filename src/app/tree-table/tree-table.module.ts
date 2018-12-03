import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeTableComponent } from './tree-table.component';
import { MaterialModule } from '../material.module';

@NgModule({
  declarations: [TreeTableComponent],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [TreeTableComponent]
})
export class TreeTableModule { }
