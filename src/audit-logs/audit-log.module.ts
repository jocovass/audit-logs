import { Module } from '@nestjs/common';
import { AuditLogService } from './services/audit-log.service';
import { AuditLogRepository } from './audit-log.repository';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuditLog } from './audit-log.entity';
import { ChecksumService } from './services/checksum.service';

@Module({
  imports: [MikroOrmModule.forFeature([AuditLog])],
  providers: [AuditLogService, AuditLogRepository, ChecksumService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
