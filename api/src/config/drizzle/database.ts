import type { BunSQLDatabase } from "drizzle-orm/bun-sql/postgres";

import { InjectDrizzle } from "@nestjs/drizzle";

export type Database = BunSQLDatabase;

export const InjectDatabase = (): ParameterDecorator & PropertyDecorator => InjectDrizzle();
