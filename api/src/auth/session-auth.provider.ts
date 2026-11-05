import { AuthenticationRegistry, SessionCookieProvider, SessionRecord } from "@nestjs/authentication";
import { Injectable } from "@nestjs/common";
import { User } from "../users/entity/user.entity.js";
import { UsersRepository } from "../users/users.repository.js";

@Injectable()
export class SessionAuth extends SessionCookieProvider<User> {

  constructor(
    private readonly usersRepository: UsersRepository,
    registry: AuthenticationRegistry,
  ){
    super();
    registry.registerProvider(this);
  }

  validate(
    session: SessionRecord,
  ) {
    return this.usersRepository.findById(session.userId);
  }
}
