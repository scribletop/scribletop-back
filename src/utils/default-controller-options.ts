import { CrudOptions } from '@nestjsx/crud/lib/interfaces';
import { merge } from 'lodash';
import { Entity } from '../types';

export const defaultCrudOptions = (type: Entity, slugField = 'slug'): CrudOptions => ({
  model: { type },
  validation: { transformOptions: { ignoreDecorators: true } },
  params: { [slugField]: { field: slugField, type: 'string', primary: true } },
  query: { maxLimit: 10, alwaysPaginate: true },
});

export const defaultCrudOptionsUnderUser = (type: Entity, slugField = 'slug'): CrudOptions =>
  merge(defaultCrudOptions(type, slugField), {
    query: { join: { members: { eager: true }, 'members.user': { eager: true } } },
    params: { username: { field: 'user.username', type: 'string' } },
  });
