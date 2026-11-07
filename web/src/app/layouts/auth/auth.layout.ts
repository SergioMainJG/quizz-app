import { Component, input } from '@angular/core';
import Image from '../../components/image/image';

@Component({
  imports: [Image],
  selector: 'auth-layout',
  templateUrl: './auth.layout.html',
})
export default class AuthLayout {
  readonly background = input.required<string>();
  readonly alt = input.required<string>();
}
