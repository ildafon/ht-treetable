import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';
import { HierTableComponent } from './hier-table.component';
import { HighlightPipe } from '../pipes/highlight.pipe';
import { PaddingDirective } from './padding.directive';

@NgModule({
  declarations: [HierTableComponent, HighlightPipe, PaddingDirective],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [ HierTableComponent]
})
export class HierTableModule { }
