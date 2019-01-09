import {Component, NgModule, VERSION, Pipe, PipeTransform} from '@angular/core'
import {BrowserModule, DomSanitizer} from '@angular/platform-browser'

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer){}

  transform(value: any, args: any): any {
    if (!args) {
      return value;
    }
    // Match in a case insensitive maneer
    const re = new RegExp(args, 'gi');

    const match = value? value.match(re): [];

    // If there's no match, just return the original value.
    if (!match) {
      return value;
    }

    const replacedValue = value? value.replace(re, "<mark>" + match[0] + "</mark>"): '';
    return this.sanitizer.bypassSecurityTrustHtml(replacedValue)
  }
}
