import { PasswordHasher } from "@nestjs/authentication";
import { ConflictException, Injectable } from "@nestjs/common";
import type { User } from "../users/entity/user.entity.js";
import { UsersRepository } from "../users/users.repository.js";
import { SignInSchemaDto, SignUpSchemaDto } from "./schema/sign-up.schema.js";

@Injectable()
export class CredentialsService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async register({ email, password, username }: SignUpSchemaDto): Promise<User> {
    if (await this.usersRepository.findByEmail(email)) {
      throw new ConflictException("Email already registered");
    }
    return this.usersRepository.create({
      username,
      email,
      password: await this.passwordHasher.hash(password),
    });
  }

  async verify({ email, password }: SignInSchemaDto): Promise<User | null> {
    const found = await this.usersRepository.findByEmail(email);

    const valid = await this.passwordHasher.verify(password, found?.password);
    if (!valid || !found?.password) return null;

    if (this.passwordHasher.needsRehash(found.password)) {
      await this.usersRepository.updatePasswordHash(
        found.id,
        await this.passwordHasher.hash(password),
      );
    }
    return found;
  }
}
