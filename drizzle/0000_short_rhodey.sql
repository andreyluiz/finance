CREATE TYPE "public"."priority" AS ENUM('very_high', 'high', 'medium', 'low', 'very_low');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "transaction_type" NOT NULL,
	"name" text NOT NULL,
	"value" numeric(19, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"priority" "priority" NOT NULL,
	"paid" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
