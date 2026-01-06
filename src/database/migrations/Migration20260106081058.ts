import { Migration } from '@mikro-orm/migrations';

export class Migration20260106081058 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create schema if not exists "audit";`);
    this.addSql(
      `create table "audit"."audit_logs" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "correlation_id" uuid null, "timestamp" timestamptz not null, "actor" jsonb not null, "action" text check ("action" in ('create', 'update', 'delete', 'read', 'login', 'logout', 'export')) not null, "category" text check ("category" in ('user', 'authentication', 'data', 'system', 'security')) not null, "resource" jsonb not null, "data" jsonb null, "changes" jsonb null, "source" text check ("source" in ('api', 'web', 'system', 'worker')) not null, "metadata" jsonb null, "checksum" varchar(255) not null, constraint "audit_logs_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "audit_logs_correlation_id_index" on "audit"."audit_logs" ("correlation_id");`,
    );
    this.addSql(
      `create index "audit_logs_category_index" on "audit"."audit_logs" ("category");`,
    );
    this.addSql(
      `create index "audit_logs_action_index" on "audit"."audit_logs" ("action");`,
    );
    this.addSql(
      `create index "audit_logs_timestamp_index" on "audit"."audit_logs" ("timestamp");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "audit"."audit_logs" cascade;`);

    this.addSql(`drop schema if exists "audit";`);
  }
}
