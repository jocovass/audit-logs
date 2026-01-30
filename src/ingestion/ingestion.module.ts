import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-logs/audit-log.module';
import { IngestionController } from './ingestion.controller';

@Module({
  imports: [AuditLogModule],
  controllers: [IngestionController],
})
export class IngestionModule {}
