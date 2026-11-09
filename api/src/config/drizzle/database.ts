import { InjectDrizzle } from "@nestjs/drizzle";
import type { BunSQLDatabase } from "drizzle-orm/bun-sql/postgres";
import { relations } from "./schemas/relations.js";

export type Database = BunSQLDatabase<typeof relations>;

export const InjectDatabase = (): ParameterDecorator & PropertyDecorator => InjectDrizzle();
