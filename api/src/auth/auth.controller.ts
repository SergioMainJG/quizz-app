import { Public, SignInService } from "@nestjs/authentication";
import { Body, Controller, HttpCode, Post, UnauthorizedException } from "@nestjs/common";
import { CredentialsService } from "./credentials.service.js";
import {
  type SignInSchemaDto,
  type SignUpSchemaDto,
  signInSchema,
  signUpSchema,
} from "./schema/sign-up.schema.js";

@Public()
@Controller("auth")
export class AuthController {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly signInService: SignInService,
  ) {}

  @Post("sign-up")
  async signUp(@Body({ schema: signUpSchema }) { email, password, username }: SignUpSchemaDto) {
    const user = await this.credentialsService.register({
      email,
      password,
      username,
    });
    await this.signInService.signIn(user.id, { method: "password" });
    return user;
  }

  @Post("sign-in")
  @HttpCode(200)
  async signIn(@Body({ schema: signInSchema }) {
    email,
    password
  }: SignInSchemaDto) {
    const user = await this.credentialsService.verify({
      email,
      password
    });
    
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }
    const { session } = await this.signInService.signIn(user.id, { method: "password" });
    return { mfaRequired: session.mfa === "pending" };
  }
}
