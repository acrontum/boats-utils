interface DatabaseOptions {
  id?: 'uuid' | 'number' | 'string';
  softDeletion?: boolean;
}

/**
 * Inserts common database fields into a model
 *
 * @param  {string}   params.id            One of 'uuid', 'number', or 'string' for the "type" key
 * @param  {boolean}  params.softDeletion  If true, adds "deletedAt" date
 *
 * @return {string}
 */
const databaseEntry = (params?: DatabaseOptions): string => {
  params = params || {};

  if (!params?.id) {
    params.id = 'uuid';
  }
  const idType = params.id === 'number' ? 'number' : 'string';

  return `
  id:
    type: ${idType}\
  ${
    params.id === 'uuid'
      ? `
    format: uuid
`
      : ''
  }
  createdAt:
    type: string
    format: date-time
  updatedAt:
    type: string
    format: date-time\
  ${
    params?.softDeletion
      ? `
  deletedAt:
    type: string
    format: date-time
  `
      : ''
  }
`;
};

module.exports = databaseEntry;
