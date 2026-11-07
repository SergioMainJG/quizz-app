import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  imports: [NgOptimizedImage],
  selector: 'app-image',
  templateUrl: './image.html',
})
export default class Image {
  readonly imgSrc       = input.required<string>();
  readonly altImg       = input.required<string>();
  readonly isBackground = input<boolean>(false); 
  readonly isPriority   = input<boolean>(false)
}
