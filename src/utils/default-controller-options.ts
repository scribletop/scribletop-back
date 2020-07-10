import { CrudOptions } from '@nestjsx/crud/lib/interfaces';
import { merge } from 'lodash';

export const defaultCrudOptions = (
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  type: any,
  slugField = 'slug',
): CrudOptions => ({
  model: {
    type,
  },
  validation: {
    transformOptions: {
      ignoreDecorators: true,
    },
  },
  params: {
    [slugField]: {
      field: slugField,
      type: 'string',
      primary: true,
    },
  },
  query: {
    maxLimit: 10,
  },
});

export const defaultCrudOptionsUnderUser = (
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  type: any,
  slugField = 'slug',
) =>
  merge(defaultCrudOptions(type, slugField), {
    query: { join: { members: { eager: true }, 'members.user': { eager: true } } },
    params: {
      username: {
        field: 'user.username',
        type: 'string',
      },
    },
  });
