import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeTableComponent } from './tree-table.component';
import { MaterialModule } from '../material.module';

import { HighlightPipe } from '../pipes/highlight.pipe';
@NgModule({
  declarations: [TreeTableComponent, HighlightPipe],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [TreeTableComponent]
})
export class TreeTableModule { }
