CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"username" varchar NOT NULL UNIQUE,
	"email" varchar UNIQUE,
	"password" varchar,
	"role" "UserRoles",
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "email_check" CHECK ("email"~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);
