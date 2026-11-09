import { Public, SignInService } from "@nestjs/authentication";
import { Body, Controller, HttpCode, Post, UnauthorizedException } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import {
  type SignInSchemaDto,
  type SignUpSchemaDto,
  signInResultSchema,
  signInSchema,
  signUpSchema,
} from "../../src/auth/schema/sign-up.schema.js";
import { apiErrorSchema, validationErrorSchema } from "../common/schemas/http-error.schema.js";
import { userResponseSchema } from "../users/schema/user-response.schema.js";
import { CredentialsService } from "./credentials.service.js";

const sessionCookieHeader = {
  "Set-Cookie": {
    description: "The session cookie: `__Host-sid`, HttpOnly, Secure, SameSite=Lax.",
    schema: { type: "string" },
  },
};

@ApiTags("Auth")
@ApiBadRequestResponse({
  description: "The body did not pass validation.",
  standardSchema: validationErrorSchema,
})
@ApiForbiddenResponse({
  description: "The request was posted from another site's page (login CSRF).",
  standardSchema: apiErrorSchema,
})
@Public()
@Controller("auth")
export class AuthController {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly signInService: SignInService,
  ) {}

  @Post("sign-up")
  @ApiOperation({
    summary: "Create an account",
    description:
      "Creates a `PLAYER` account and signs it in: the response sets the session cookie.",
  })
  @ApiCreatedResponse({
    description: "The new account.",
    standardSchema: userResponseSchema,
    headers: sessionCookieHeader,
  })
  @ApiConflictResponse({
    description: "The email or the username is already registered.",
    standardSchema: apiErrorSchema,
  })
  async signUp(@Body({ schema: signUpSchema }) { email, password, username }: SignUpSchemaDto) {
    const user = await this.credentialsService.register({ email, password, username });
    await this.signInService.signIn(user.id, { method: "password" });
    return userResponseSchema.assert(user);
  }

  @Post("sign-in")
  @HttpCode(200)
  @ApiOperation({
    summary: "Sign in with email and password",
    description:
      "Sets the session cookie. When `mfaRequired` is true, the session can't be used until it passes the second factor.",
  })
  @ApiOkResponse({
    description: "Signed in.",
    standardSchema: signInResultSchema,
    headers: sessionCookieHeader,
  })
  @ApiUnauthorizedResponse({
    description: "The email or the password is wrong.",
    standardSchema: apiErrorSchema,
  })
  async signIn(@Body({ schema: signInSchema }) { email, password }: SignInSchemaDto) {
    const user = await this.credentialsService.verify({ email, password });
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }
    const { session } = await this.signInService.signIn(user.id, { method: "password" });
    return { mfaRequired: session.mfa === "pending" };
  }
}
