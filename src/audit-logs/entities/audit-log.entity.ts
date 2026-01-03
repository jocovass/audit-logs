import { Entity, Enum, Index, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../database/entity.base';

@Entity({ tableName: 'audit_logs' })
@Index({ properties: ['timestamp'] })
@Index({ properties: ['action'] })
@Index({ properties: ['category'] })
@Index({ properties: ['correlationId'] })
export class AuditLog extends BaseEntity {
  // NOTE: add back when account enitity is implemented
  //   @Property()
  //   accountId!: string;

  @Property({ type: 'uuid', nullable: true })
  correlationId?: string;

  @Property({ type: 'datetime', columnType: 'timestamptz' })
  timestamp!: Date;

  @Property({ type: 'jsonb' })
  actor: {
    id: string;
    type: 'user' | 'system' | 'api_key';
    email?: string;
    ipAddress?: string;
    userAgent?: string;
  };

  @Enum(() => AuditAction)
  action!: AuditAction;

  @Enum(() => AuditCategory)
  category!: AuditCategory;

  @Property({ type: 'jsonb' })
  resource!: Record<string, unknown>;

  @Property({ type: 'jsonb', nullable: true })
  data?: Record<string, unknown>;

  @Property({ type: 'jsonb', nullable: true })
  changes?: Record<string, unknown>;

  @Enum(() => AuditSource)
  source!: AuditSource;

  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Property()
  checksum!: string;
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
}

export enum AuditCategory {
  USER = 'user',
  AUTHENTICATION = 'authentication',
  DATA = 'data',
  SYSTEM = 'system',
  SECURITY = 'security',
}

export enum AuditSource {
  API = 'api',
  WEB = 'web',
  SYSTEM = 'system',
  WORKER = 'worker',
}
