import { createHmac, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAppConfig } from '../../config/schema/app.schema';
import stringify from 'fast-json-stable-stringify';

@Injectable()
export class ChecksumService {
  constructor(private readonly config: ConfigService<IAppConfig, true>) {}

  generateChecksum(data: Record<string, unknown>): string {
    const hash = createHmac(
      'sha256',
      this.config.get('CHECKSUM_HASH_SECRET', { infer: true }),
    );
    const dataString = stringify(data);
    hash.update(dataString);
    return hash.digest('hex');
  }

  verifyChecksum(data: Record<string, unknown>, checksum: string): boolean {
    const expected = Buffer.from(this.generateChecksum(data), 'hex');
    const provided = Buffer.from(checksum, 'hex');
    if (expected.length !== provided.length) {
      return false;
    }
    return timingSafeEqual(expected, provided);
  }
}
