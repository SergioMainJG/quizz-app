import { Component, input } from "@angular/core";
import { type Field, FormField } from "@angular/forms/signals";
import { MatError, MatFormField, MatHint, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";

@Component({
  imports: [MatFormField, MatLabel, MatHint, MatError, MatInput, FormField],
  selector: "form-fields",
  templateUrl: "./fields.html",
})
export default class Fields {
  readonly formField = input.required<Field<string>>();
  readonly label = input.required<string>();
  readonly hint = input("");
  readonly type = input<"text" | "email" | "password" | "number">("text");
  readonly placeholder = input("");
  readonly autocomplete = input("");
}