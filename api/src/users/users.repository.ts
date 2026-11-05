import { ConflictException, Injectable } from "@nestjs/common";
import { InjectDrizzle } from "@nestjs/drizzle";
import { eq } from "drizzle-orm";
import { SignUpSchemaDto } from "../auth/schema/sign-up.schema.js";
import type { Database } from "../config/drizzle/database.js";
import { users } from "../config/drizzle/schemas/index.js";
import { UsersSelectSchema } from "../config/drizzle/schemas/users.schema.js";
import { User } from "./entity/user.entity.js";

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: Database,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    const [row] = await this.db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return row ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return row ?? null;
  }

  async findByEmail(email: string): Promise<UsersSelectSchema | null> {
    const [row] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return row ?? null;
  }

  async create(newUser: SignUpSchemaDto): Promise<UsersSelectSchema> {
    const [byUsername, byEmail] = await Promise.all([
      this.findByUsername(newUser.username),
      this.findByEmail(newUser.email),
    ]);

    if (byUsername) throw new ConflictException("username already used");
    if (byEmail) throw new ConflictException("email already used");

    const [created] = await this.db
      .insert(users)
      .values({
        ...newUser,
        role: "PLAYER",
      })
      .returning();
    return created;
  }

  async delete(id: string): Promise<null> {
    await this.db.delete(users).where(eq(users.id, id));
    return null;
  }

  async updatePasswordHash(id: string, password: string): Promise<undefined>{
    await this.db.update(users).set({password: password}).where(eq(users.id, id));
  }
}
