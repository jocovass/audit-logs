import { PrimaryKey, Property, OptionalProps, types } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';

export abstract class BaseEntity<Optional = never> {
  [OptionalProps]?: 'createdAt' | 'updatedAt' | Optional;

  @PrimaryKey({ type: types.uuid, defaultRaw: 'gen_random_uuid()' })
  id = uuidv7();

  @Property({
    type: 'datetime',
    columnType: 'timestamptz',
    defaultRaw: 'now()',
  })
  createdAt = new Date();

  @Property({
    type: 'datetime',
    columnType: 'timestamptz',
    onUpdate: () => new Date(),
    defaultRaw: 'now()',
  })
  updatedAt = new Date();
}
