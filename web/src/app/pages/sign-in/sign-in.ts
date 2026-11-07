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
import { SignInRequest, signInRequestSchema } from "../../schemas/auth/sign-in-req.schema";

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
  selector: "sign-in",
  templateUrl: "./sign-in.html",
})
export default class SignIn {
  protected readonly authManagement = injectAsync(
    () => import("../../services/auth/auth-management"),
    {
      prefetch: onIdle,
    },
  );

  protected readonly signInForm = form(
    signal<SignInRequest>({
      email: "",
      password: "",
    }),
    (schemaPath) => validateStandardSchema(schemaPath, () => signInRequestSchema),
    {
      submission: {
        action: async (fields) => {
          const authManagement = await this.authManagement();
          try {
            await firstValueFrom(authManagement.signIn(fields().value()));
          } catch (error) {
            return toFormErrors(error, fields);
          }
          return;
        },
      },
    },
  );

  protected readonly backgroundSrc = "/images/sign-in.avif";
  protected readonly alt = `Sign Up Image`;

  protected readonly hintEmail = computed(() => {
    if (this.signInForm.email().dirty() && !this.signInForm.email().touched())
      return "Use a valid email.";
    return "";
  });



  protected readonly hintPassword = computed(() => {
    if (this.signInForm.password().dirty() && !this.signInForm.password().touched())
      return "More than 11 characters.";
    return "";
  });
}
