import { expect } from 'chai';
import { relative } from 'path';
import { boatsFixtureFolder } from './shared';

describe(relative(process.cwd(), __filename), () => {
  let apiSpec: Record<string, any>;

  before(async () => {
    apiSpec = await boatsFixtureFolder('test-api-spec');

    expect(apiSpec?.info?.version).equals('0');
    expect(apiSpec?.components?.schemas?.Meta).deep.equals({
      type: 'object',
      properties: {
        default: {
          type: 'boolean',
        },
      },
    });
  });

  it('pagination: generates pagination models', async () => {
    expect(apiSpec.components.schemas.PaginationAlt).deep.equals({
      type: 'object',
      properties: {
        nonDefault: {
          type: 'string',
        },
      },
    });

    expect(apiSpec.components.schemas.Pagination).deep.equals({
      type: 'object',
      properties: {
        id: {
          type: 'integer',
        },
        date: {
          type: 'string',
          format: 'date',
        },
      },
    });

    expect(apiSpec.components.schemas.PaginationTestDefaultParams).deep.equals({
      type: 'object',
      required: ['meta', 'data'],
      properties: {
        meta: {
          $ref: '#/components/schemas/Meta',
        },
        data: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Pagination',
          },
        },
      },
    });

    expect(apiSpec.components.schemas.PaginationTestPagination).deep.equals({
      type: 'object',
      required: ['meta', 'data'],
      properties: {
        meta: {
          $ref: '#/components/schemas/PaginationAlt',
        },
        data: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Pagination',
          },
        },
      },
    });

    expect(apiSpec.components.schemas.PaginationTestPath).deep.equals({
      type: 'object',
      required: ['meta', 'data'],
      properties: {
        meta: {
          $ref: '#/components/schemas/Meta',
        },
        data: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/PaginationAlt',
          },
        },
      },
    });

    expect(apiSpec.components.schemas.PaginationTestStringOptions).deep.equals({
      type: 'object',
      required: ['meta', 'data'],
      properties: {
        meta: {
          $ref: '#/components/schemas/Meta',
        },
        data: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/PaginationAlt',
          },
        },
      },
    });

    expect(apiSpec.components.schemas.PaginationTestTemplate).deep.equals({
      type: 'object',
      required: ['meta', 'data'],
      properties: {
        meta: {
          $ref: '#/components/schemas/Meta',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              asdf: {
                type: 'number',
                format: 'uuid',
              },
            },
          },
        },
      },
    });

    expect(apiSpec.components.schemas.PaginationTestRequired).deep.equals({
      type: 'object',
      required: ['meta'],
      properties: {
        meta: {
          $ref: '#/components/schemas/Meta',
        },
        data: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Pagination',
          },
        },
      },
    });

    expect(apiSpec.components.schemas.PaginationTestRequiredNone).deep.equals({
      type: 'object',
      properties: {
        meta: {
          $ref: '#/components/schemas/Meta',
        },
        data: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Pagination',
          },
        },
      },
    });
  });

  it('extend: generates models by extension', async () => {
    expect(apiSpec.components.schemas.Extend).deep.equals({
      type: 'object',
      required: ['deletedAt'],
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
        },
        deletedAt: {
          type: 'string',
          format: 'date-time',
        },
        name: {
          type: 'string',
        },
      },
    });

    expect(apiSpec.components.schemas.ExtendInclude).deep.equals({
      type: 'object',
      required: ['deletedAt'],
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
        },
        deletedAt: {
          type: 'string',
          format: 'date-time',
        },
        name: {
          type: 'string',
        },
        codename: {
          type: 'string',
        },
        yml: {
          $ref: '#/components/schemas/Meta',
        },
      },
    });

    expect(apiSpec.components.schemas.ExtendOmit).deep.equals({
      type: 'object',
      required: ['deletedAt'],
      properties: {
        deletedAt: {
          type: 'string',
          format: 'date-time',
        },
        name: {
          type: 'string',
        },
      },
    });

    expect(apiSpec.components.schemas.ExtendOptional).deep.equals({
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
        },
        deletedAt: {
          type: 'string',
          format: 'date-time',
        },
        name: {
          type: 'string',
        },
      },
    });

    expect(apiSpec.components.schemas.ExtendRequire).deep.equals({
      type: 'object',
      required: ['deletedAt', 'name', 'codename'],
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
        },
        deletedAt: {
          type: 'string',
          format: 'date-time',
        },
        name: {
          type: 'string',
        },
      },
    });

    expect(apiSpec.components.schemas.ExtendAll).deep.equals({
      type: 'object',
      required: ['name', 'codename'],
      properties: {
        deletedAt: {
          type: 'string',
          format: 'date-time',
        },
        name: {
          type: 'string',
        },
        codename: {
          type: 'string',
        },
        yml: {
          $ref: '#/components/schemas/Meta',
        },
      },
    });
  });

  it('database-entry: generates entity fields', async () => {
    expect(apiSpec.components.schemas.DatabaseEntryDefault).deep.equals({
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
        },
        key: {
          type: 'string',
        },
      },
    });

    expect(apiSpec.components.schemas.DatabaseEntryIdNumber).deep.equals({
      type: 'object',
      properties: {
        id: {
          type: 'number',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
        },
        key: {
          type: 'string',
        },
      },
    });

    expect(apiSpec.components.schemas.DatabaseEntryIdString).deep.equals({
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
        },
        key: {
          type: 'string',
        },
      },
    });

    expect(apiSpec.components.schemas.DatabaseEntryIdUuid).deep.equals({
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
        },
        key: {
          type: 'string',
        },
      },
    });

    expect(apiSpec.components.schemas.DatabaseEntrySoftDelete).deep.equals({
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
        },
        deletedAt: {
          type: 'string',
          format: 'date-time',
          nullable: true,
        },
        key: {
          type: 'string',
        },
      },
    });
  });
});
