import { expect } from 'chai';
import { ChildProcess, exec } from 'child_process';
import { promises as fs } from 'fs';
import { relative, resolve } from 'path';

interface AsyncProcess {
  proc: ChildProcess;
  promise: Promise<string>;
  resolve: (stdout: string) => void;
  reject: (err: any) => void;
}

const runCommand = (cmd: string): AsyncProcess => {
  let resolve: AsyncProcess['resolve'];
  let reject: AsyncProcess['reject'];

  const promise = new Promise<string>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const proc = exec(cmd.trim(), (err, stdout) => (err ? reject(err) : resolve(stdout)));

  return { proc, promise, resolve, reject };
};

describe(relative(process.cwd(), __filename), () => {
  let apiSpec: Record<string, any>;

  before(async () => {
    await fs.rm(resolve('test/.boats'), { recursive: true, force: true });

    await runCommand(`\
      NODE_ENV=test node node_modules/boats/bin/cli.js \
        -f dist/src \
        -i test/fixtures/test-api-spec/src/index.yml \
        -o test/.boats/api.json
    `).promise;

    apiSpec = require(resolve('test/.boats/api_0.json'));

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
        },
        key: {
          type: 'string',
        },
      },
    });
  });
});
