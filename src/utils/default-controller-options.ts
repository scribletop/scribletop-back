import { CrudOptions } from '@nestjsx/crud/lib/interfaces';

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
});
