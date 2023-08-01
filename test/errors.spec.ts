import { expect } from 'chai';
import { promises as fs } from 'fs';
import { relative, resolve } from 'path';
import { boatsFixtureFolder } from './shared';

describe(relative(process.cwd(), __filename), () => {
  before(async () => {
    await fs.rm(resolve('test/.boats'), { recursive: true, force: true });
  });

  it('extend: handles duplicate required', async () => {
    const spec = await boatsFixtureFolder('err-duplicate-requires');

    expect(spec.components.schemas.Extend).deep.equals({
      type: 'object',
      required: ['deletedAt', 'id', 'name'],
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
  });
});
