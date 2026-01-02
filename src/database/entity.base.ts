import { PrimaryKey, Property, OptionalProps, types } from '@mikro-orm/core';
import { v7 } from 'uuid';

export abstract class BaseEntity<Optional = never> {
  [OptionalProps]?: 'createdAt' | 'updatedAt' | Optional;

  @PrimaryKey({ type: types.uuid })
  id = v7();

  @Property({ type: 'datetime', columnType: 'timestamptz' })
  createdAt = new Date();

  @Property({
    type: 'datetime',
    columnType: 'timestamptz',
    onUpdate: () => new Date(),
  })
  updatedAt = new Date();
}
