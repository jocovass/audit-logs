import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsIP,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AuditActorType } from '../audit-log.enums';

export class AuditActorDto {
  @IsDefined()
  @IsUUID()
  id!: string;

  @IsDefined()
  @IsEnum(AuditActorType)
  type!: AuditActorType;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
