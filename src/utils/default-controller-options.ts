import { CrudOptions } from '@nestjsx/crud/lib/interfaces';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const defaultCrudOptions = (type: any): CrudOptions => ({
  model: {
    type,
  },
  validation: {
    transformOptions: {
      ignoreDecorators: true,
    },
  },
  params: {
    slug: {
      field: 'slug',
      type: 'string',
      primary: true,
    },
  },
});
