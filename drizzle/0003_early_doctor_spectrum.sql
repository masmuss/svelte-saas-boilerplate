CREATE TABLE "billing_event" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"organization_id" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "billing_event" ADD CONSTRAINT "billing_event_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "billing_event_provider_event_unique" ON "billing_event" USING btree ("provider","event_id");--> statement-breakpoint
CREATE INDEX "billing_event_organization_id_idx" ON "billing_event" USING btree ("organization_id");