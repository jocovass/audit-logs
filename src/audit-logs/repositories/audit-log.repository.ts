import {
  PaginationOptions,
  PaginatedResult,
} from 'src/common/interfaces/api-interface';
import { AuditLog } from '../entities/audit-log.entity';
import {
  AuditLogQueryFilters,
  IAuditLogRepository,
} from '../interfaces/audit-log-repository.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  EntityManager,
  EntityRepository,
  FilterValue,
} from '@mikro-orm/postgresql';

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: EntityRepository<AuditLog>,
    private readonly em: EntityManager,
  ) {}
  async append(
    accountId: string,
    auditLog: Omit<AuditLog, 'id' | 'accountId'>,
  ): Promise<AuditLog> {
    const entity = this.auditLogRepo.create({
      ...auditLog,
      // NOTE: add back when account entity is implemented
      //   accountId,
    });
    await this.em.persist(entity).flush();
    return entity;
  }

  async count(
    accountId: string,
    filters: AuditLogQueryFilters,
  ): Promise<number> {
    // NOTE: include accountId after implemented
    return this.auditLogRepo.count({ ...filters });
  }

  async findAll(
    accountId: string,
    filters: AuditLogQueryFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<AuditLog>> {
    const limit = pagination.limit ?? 30;
    const where: AuditLogQueryFilters & { id?: FilterValue<string> } = {
      ...filters,
    };

    if (pagination.cursor) {
      // If cursor provided, fetch records after that cursor
      // UUID v7 is time-sortable, so we can use < for descending order
      where.id = { $lt: pagination.cursor };
    }

    const result = await this.auditLogRepo.find(where, {
      limit: limit + 1, // Fetch one extra to check for next page
      orderBy: { id: 'DESC' },
    });
    const hasNextPage = result.length > limit;
    const data = hasNextPage ? result.slice(0, limit) : result;

    return {
      data,
      nextCursor: hasNextPage ? data[data.length - 1].id : null,
      hasMore: hasNextPage,
    };
  }

  async findById(accountId: string, id: string): Promise<AuditLog | null> {
    return this.auditLogRepo.findOne({ id });
  }
}
