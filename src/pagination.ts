import * as nunjucks from 'nunjucks';

interface PaginationOptions {
  path?: string;
  template?: string;
  paginationModel?: string;
}

type PaginationHelper = (options: PaginationOptions) => string;

/**
 * Add default pagination to a models.yml file
 *
 * @param  {string|PaginationOptions} options           If options is a string, it is treated as options.path
 * @param  {string}                   options.path      The path to the data model
 * @param  {string}                   options.template  A template to render into data.items
 *
 * @return {string}
 */
const pagination =
  (njk: nunjucks.Environment): PaginationHelper =>
  (options: string | PaginationOptions) => {
    let template = '$ref: "./model.yml"';

    if (typeof options === 'string') {
      options = { path: options };
    }

    if (options?.path) {
      template = `$ref: "${options.path}"`;
    } else if (options?.template) {
      template = njk.renderString(options.template, {});
    }

    return `\
type: object
properties:
  meta:
    $ref: "${options?.paginationModel || '#/components/schemas/Meta'}"
  data:
    type: array
    items:
      ${template}
`;
  };

module.exports = pagination;
