CREATE TYPE "QuizDifficulties" AS ENUM('EASY', 'MEDIUM', 'HARD');--> statement-breakpoint
CREATE TABLE "options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"questionId" uuid,
	"text" varchar NOT NULL UNIQUE,
	"isCorrect" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"quizId" uuid,
	"text" varchar NOT NULL UNIQUE,
	"points" integer DEFAULT 10 NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" varchar NOT NULL UNIQUE,
	"description" text NOT NULL UNIQUE,
	"category" varchar NOT NULL,
	"difficulty" "QuizDifficulties" DEFAULT 'EASY'::"QuizDifficulties",
	"isPublished" boolean DEFAULT false,
	"authorId" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
