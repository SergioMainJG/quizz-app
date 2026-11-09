import { Injectable } from "@nestjs/common";
import { UsersInsertSchema } from "../config/drizzle/schemas/users.schema.js";
import { User } from "./entity/user.entity.js";
import { UsersRepository } from "./users.repository.js";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(user: UsersInsertSchema): Promise<UsersInsertSchema> {
    return await this.usersRepository.create(user);
  }

  async findOneById(id: string): Promise<User | null> {
    return await this.usersRepository.findById(id);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findByEmail(email);
  }
  async findOneByUsername(username: string): Promise<User | null> {
    return await this.usersRepository.findByUsername(username);
  }
}
