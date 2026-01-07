import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogRepository } from '../audit-log.repository';
import { AuditLog } from '../audit-log.entity';
import { AuditLogQueryFilters } from '../audit-log-repository.interface';
import { PaginationOptions } from 'src/common/interfaces/api-interface';
import { ChecksumService } from './checksum.service';

@Injectable()
export class AuditLogService {
  constructor(
    private readonly auditLogRepository: AuditLogRepository,
    private readonly checksumService: ChecksumService,
  ) {}

  private getAccountId(): string {
    // In a real implementation, retrieve the account ID from the context/session
    return 'accountId-placeholder';
  }

  async createAuditLog(data: Omit<AuditLog, 'id' | 'accountId'>) {
    const accountId = this.getAccountId();
    const checksum = this.checksumService.generateChecksum(data);
    try {
      return await this.auditLogRepository.append(accountId, {
        ...data,
        checksum,
      });
    } catch (error) {
      if (error instanceof Error) {
        // FIXME: Replace with proper logging
        console.error(
          `Failed to create audit log: ${error.message}`,
          error.stack,
        );
      }
      throw new InternalServerErrorException('Failed to create audit log');
    }
  }

  async getAuditLogs(
    filters: AuditLogQueryFilters = {},
    pagination: PaginationOptions = {},
  ) {
    const accountId = this.getAccountId();
    try {
      return await this.auditLogRepository.findAll(
        accountId,
        filters,
        pagination,
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Failed to retrieve audit logs: ${error.message}`,
          error.stack,
        );
      }
      throw new InternalServerErrorException('Failed to fetch audit logs');
    }
  }

  async getAuditLogById(id: string) {
    const accountId = this.getAccountId();
    try {
      const data = await this.auditLogRepository.findById(accountId, id);
      if (!data) {
        throw new NotFoundException(`Audit log with ID "${id}" not found`);
      }
      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        console.error(error.message);
        throw error;
      }

      if (error instanceof Error) {
        console.error(
          `Failed to retrieve audit log by ID: ${error.message}`,
          error.stack,
        );
      }
      throw new InternalServerErrorException('Failed to fetch audit log by ID');
    }
  }
}
