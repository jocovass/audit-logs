// NOTE: Once AuditLog entity is defined, replace all 'any' with it
// import { AuditLog } from '../../audit-logs/entities/audit-log.entity';

import {
  PaginatedResult,
  PaginationOptions,
} from '../../common/interfaces/api-interface';
import {
  AuditAction,
  AuditActorType,
  AuditCategory,
  AuditSource,
} from '../enums/audit-log.enums';

/**
 * Query filters for audit logs
 * All queries are scoped by accountId for tenant isolation
 */
export type AuditLogQueryFilters = {
  actorId?: string;
  actorType?: AuditActorType;
  action?: AuditAction;
  category?: AuditCategory;
  source?: AuditSource;
  correlationId?: string;
  startDate?: Date;
  endDate?: Date;
};

/**
 * Audit Log Repository Interface
 *
 * Note: This is an append-only repository.
 * No update or delete methods — audit logs are immutable.
 */
export interface IAuditLogRepository {
  /**
   * Append a new audit log entry
   * @param accountId - Tenant identifier
   * @param auditLog - The audit log data (without id, receivedAt, checksum)
   */
  append(
    accountId: string,
    // auditLog: Omit<AuditLog, 'id' | 'accountId' | 'receivedAt' | 'checksum'>,
    auditLog: any,
  ): Promise<any>;

  /**
   * Find a single audit log by ID
   * Returns null if not found OR if it belongs to a different account
   * @param accountId - Tenant identifier (for isolation)
   * @param id - Audit log ID
   */
  //   findById(accountId: string, id: string): Promise<AuditLog | null>;
  findById(accountId: string, id: string): Promise<any>;

  /**
   * Find audit logs with filtering and pagination
   * @param accountId - Tenant identifier (for isolation)
   * @param filters - Query filters
   * @param pagination - Pagination options
   */
  findAll(
    accountId: string,
    filters: AuditLogQueryFilters,
    pagination: PaginationOptions,
    //   ): Promise<PaginatedResult<AuditLog>>;
  ): Promise<PaginatedResult<any>>;

  /**
   * Count audit logs matching filters
   * Useful for dashboard stats
   * @param accountId - Tenant identifier
   * @param filters - Query filters
   */
  count(accountId: string, filters: AuditLogQueryFilters): Promise<number>;
}

export const AUDIT_LOG_REPOSITORY = Symbol('IAuditLogRepository');
