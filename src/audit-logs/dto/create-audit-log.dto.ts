import { Type } from 'class-transformer';
import {
  IsDate,
  IsDefined,
  IsEnum,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import {
  AuditAction,
  AuditCategory,
  AuditSource,
} from '../enums/audit-log.enums';
import { AuditActorDto } from './audit-actor.dto';

export class CreateAuditLogDto {
  @IsDefined()
  @Type(() => Date)
  @IsDate()
  timestamp!: Date;

  @IsDefined()
  @ValidateNested()
  @Type(() => AuditActorDto)
  actor!: AuditActorDto;

  @IsDefined()
  @IsEnum(AuditAction)
  action!: AuditAction;

  @IsDefined()
  @IsEnum(AuditCategory)
  category!: AuditCategory;

  @IsDefined()
  @IsObject()
  resource!: Record<string, unknown>;

  @IsDefined()
  @IsEnum(AuditSource)
  source!: AuditSource;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  changes?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
