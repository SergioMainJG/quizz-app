import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { map, Observable } from "rxjs";
import { SignInRequest } from "../../schemas/auth/sign-in-req.schema";
import { SignInResponse, signInResponseSchema } from "../../schemas/auth/sign-in-res.schema";
import { SignUpRequest } from "../../schemas/auth/sign-up-req.schema";
import { SignUpResponse, signUpResponseSchema } from "../../schemas/auth/sign-up-res.schema";

const SIGN_UP_ROUTE = `/api/auth/sign-up`;
const SIGN_IN_ROUTE = `/api/auth/sign-in`;

@Service()
export default class AuthManagement {
  private readonly http = inject(HttpClient);

  signUp(body: SignUpRequest): Observable<SignUpResponse> {
    console.log({ body });
    return this.http
      .post<unknown>(SIGN_UP_ROUTE, body)
      .pipe(map((response) => signUpResponseSchema.assert(response)));
  }

  signIn(body: SignInRequest): Observable<SignInResponse> {
    return this.http
      .post<unknown>(SIGN_IN_ROUTE, body)
      .pipe(map((response) => signInResponseSchema.assert(response)));
  }
}
