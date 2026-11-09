import { Component, computed, injectAsync, onIdle, signal } from "@angular/core";
import { FormRoot, form, validateStandardSchema } from "@angular/forms/signals";
import { RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import Fields from "../../components/form/fields/fields";
import SubmitButton from "../../components/form/submit-button/submit-button";
import { toFormErrors } from "../../helpers/forms/to-form-errors";
import { SignInRequest, signInRequestSchema } from "../../schemas/auth/sign-in-req.schema";

@Component({
  imports: [
    FormRoot,
    RouterLink,
    Fields,
    SubmitButton,
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

  protected readonly isFormValid = computed(()=>this.signInForm().valid());
}
