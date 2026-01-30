import { Body, Controller, Post } from '@nestjs/common';
import { CreateAuditLogDto } from '../audit-logs/dto/create-audit-log.dto';
import { AuditLogService } from '../audit-logs/services/audit-log.service';

@Controller('events')
export class IngestionController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Post()
  async ingestEvent(@Body() createAuditLogDto: CreateAuditLogDto) {
    // NOTE: We potentially want to intoduce async processing here in the future
    // utilizing a message queue to handle high throughput of incoming events.
    const data = await this.auditLogService.createAuditLog(createAuditLogDto);
    return { data };
  }
}
