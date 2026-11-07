import { Component, computed, injectAsync, onIdle, signal } from "@angular/core";
import { FormField, FormRoot, form, validateStandardSchema } from "@angular/forms/signals";
import { MatButton } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatTooltip } from "@angular/material/tooltip";
import { RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { toFormErrors } from "../../helpers/forms/to-form-errors";
import AuthLayout from "../../layouts/auth/auth.layout";
import { SignUpRequest, signUpRequestSchema } from "../../schemas/auth/sign-up-req.schema";

@Component({
  imports: [
    FormField,
    FormRoot,
    MatFormFieldModule,
    MatInputModule,
    AuthLayout,
    MatButton,
    MatTooltip,
    RouterLink,
  ],
  selector: "sign-up",
  templateUrl: "./sign-up.html",
})
export default class SignUp {
  protected readonly authManagement = injectAsync(
    () => import("../../services/auth/auth-management"),
    {
      prefetch: onIdle,
    },
  );

  protected readonly signUpForm = form(
    signal<SignUpRequest>({
      username: "",
      email: "",
      password: "",
    }),
    (schemaPath) => {
      validateStandardSchema(schemaPath, () => signUpRequestSchema);
    },
    {
      submission: {
        action: async (fields) => {
          const auth = await this.authManagement();

          try {
            await firstValueFrom(auth.signUp(fields().value()));
          } catch (error) {
            return toFormErrors(error, fields);
          }
          return;
        },
      },
    },
  );
  protected readonly backgroundSrc = "/images/sign-up.avif";
  protected readonly alt = "Sign In Image";

  protected readonly hintEmail = computed(() => {
    if (this.signUpForm.email().dirty() && !this.signUpForm.email().touched())
      return "Use a valid email.";
    return "";
  });

  protected readonly hintUsername = computed(() => {
    if (this.signUpForm.username().dirty() && !this.signUpForm.username().touched())
      return "Choose something funny as username.";
    return "";
  });

  protected readonly hintPassword = computed(() => {
    if (this.signUpForm.password().dirty() && !this.signUpForm.password().touched())
      return "More than 11 characters.";
    return "";
  });
}
