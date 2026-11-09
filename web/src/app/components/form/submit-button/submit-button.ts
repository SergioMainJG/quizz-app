import { Component, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  imports: [MatButton, MatTooltip],
  selector: 'submit-button',
  templateUrl: './submit-button.html',
})
export default class SubmitButton {
  readonly isFormValid = input.required<boolean>();
  readonly suggestAboutForm = input.required<string>();
  readonly invalidMessage = input.required<string>();
  readonly validMessage = input.required<string>();
}
