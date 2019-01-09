import { Directive, Input, ElementRef, Renderer2, OnInit } from '@angular/core';
import { htFmsItemI } from '../models';

@Directive({
  selector: '[htPadding]'
})
export class PaddingDirective  implements OnInit {

  @Input('htPadding')
    get level(): number   { return this._level; }
    set level(level: number) {
      if (!level) {return;}
      
      this._level = +level
    }

  _level: number;

  @Input('htPaddingIndent')
    get indent(): number   { return this._indent; }
    set indent(indent: number) {
      if (!indent) {return;}
      
      this._indent = +indent
    }

  _indent: number = 40;
  

  constructor(
      private _el: ElementRef,
      private _renderer: Renderer2) 
      { 
        
        
      }

  ngOnInit() {
    this._setPadding();
  }

 _setPadding() {
    const padding = this.level ? `${(this._level * this._indent) - 11}px` : null;
    // console.log('in setPadding Directory', this.level, this.indent, padding);
    this._renderer.setStyle(this._el.nativeElement, 'paddingLeft', padding);
 }     
}
