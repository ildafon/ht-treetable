import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../material.module';
import { HierTableComponent } from './hier-table.component';
import { HighlightPipe } from '../pipes/highlight.pipe';

@NgModule({
  declarations: [HierTableComponent, HighlightPipe],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [ HierTableComponent]
})
export class HierTableModule { }
