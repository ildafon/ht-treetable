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
    const padding = this.level ? `${this.level * this._indent}px` : null;
    console.log('in setPadding Directory', this.level);
    this._renderer.setStyle(this._el.nativeElement, 'paddingLeft', padding);
 }     
}
