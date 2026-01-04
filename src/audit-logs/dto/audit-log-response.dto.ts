import { CreateAuditLogDto } from './create-audit-log.dto';

export class AuditLogResponseDto extends CreateAuditLogDto {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  correlationId?: string;
}
