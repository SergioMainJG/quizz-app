import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  imports: [NgOptimizedImage],
  selector: 'app-image',
  templateUrl: './image.html',
  host: { class: 'relative block overflow-hidden' }
})
export default class Image {
  readonly imgSrc       = input.required<string>();
  readonly altImg       = input.required<string>();
  readonly isPriority   = input<boolean>(false)
  readonly fit          = input<"cover"|"contain">("cover");
  readonly sizes        = input("100vw");
}
