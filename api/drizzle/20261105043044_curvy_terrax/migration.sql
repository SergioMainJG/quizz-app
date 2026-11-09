CREATE TYPE "UserRoles" AS ENUM('PLAYER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"username" varchar NOT NULL UNIQUE,
	"email" varchar NOT NULL UNIQUE,
	"password" varchar NOT NULL,
	"role" "UserRoles" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_check" CHECK ("email"~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);
