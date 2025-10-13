ALTER TABLE "transactions" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
CREATE INDEX "transactions_user_id_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_sort_idx" ON "transactions" USING btree ("user_id","paid","priority","created_at");