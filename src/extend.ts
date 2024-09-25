/**
 * usage:
 *   {{ extend('path/to/model.yml', options) }}
 *
 * options is an object with any of these keys:
 *   omit: array of nested keys to remove
 *   require: array of nested keys to make required
 *   optional: array of nested keys to make optional
 *   include: array of arrays. first element is nested key, second is schema object
 *
 *
 * example:
 *   given a model (model.yml):
 *
 *   type: object
 *   required:
 *     - deletedAt
 *   properties:
 *     id:
 *       type: string
 *       format: uuid
 *     deletedAt:
 *       type: string
 *       format: date-time
 *     name:
 *       type: string
 *
 *   and another schema (post.yml):
 *   {{
 *     extend('./model.yml', {
 *       omit: [
 *         'properties.id'
 *       ],
 *       require: [
 *         'properties.name'
 *         'properties.codename'
 *       ],
 *       optional: [
 *         'properties.deletedAt'
 *       ],
 *       include: [
 *         ['properties.codename', { type: 'string' }]
 *       ]
 *     })
 *   }}
 *
 *   will produce (post.yml):
 *
 *   type: object
 *   required:
 *     - name
 *     - codename
 *   properties:
 *     deletedAt:
 *       type: string
 *       format: date-time
 *     name:
 *       type: string
 *     codename:
 *       type: string
 *
 */

import { readFileSync } from 'fs';
import * as jsYaml from 'js-yaml';
import { Environment } from 'nunjucks';
import { dirname, join, resolve } from 'path';

interface ExtendOptions {
  require?: string[];
  optional?: string[];
  omit?: string[];
  include?: [string, Record<string, any>][];
}

interface ContainerObject {
  item: Record<string, any>;
  last: string;
  lastProp: Record<string, any> | null;
}

const getContainerObj = (model: Record<string, any>, key: string): ContainerObject => {
  let item = model;
  const parts = key.split(/[\.[\]]+/).filter(Boolean);
  const last = parts.pop() as string;
  let lastProp = null;

  for (const part of parts) {
    if (part === 'properties') {
      lastProp = item;
    }
    item = item?.[part];
  }

  return { item, last, lastProp };
};

const deleteNested = (model: Record<string, any>, key: string): Record<string, any> => {
  const { item, last } = getContainerObj(model, key);

  if (Array.isArray(item)) {
    item.splice(parseInt(last, 10), 1);
  } else {
    delete item?.[last];
  }

  required(model, key, false);

  return model;
};

const setNested = (model: Record<string, any>, key: string, value: Record<string, any>): Record<string, any> => {
  const { item, last } = getContainerObj(model, key);
  item[last] = value;

  return model;
};

const required = (model: Record<string, any>, key: string, isRequired: boolean): Record<string, any> => {
  const { last, lastProp } = getContainerObj(model, key);

  if (lastProp) {
    lastProp.required = lastProp.required || [];

    if (isRequired) {
      lastProp.required.push(last);
      lastProp.required = [...new Set(lastProp.required).keys()];
    } else {
      const index = lastProp.required.indexOf(last);
      if (index > -1) {
        lastProp.required.splice(index, 1);
      }
    }

    if (!lastProp.required?.length) {
      delete lastProp.required;
    }
  }

  return model;
};

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports
const { default: Template } = require(`${process.cwd()}/node_modules/boats/build/src/Template`);

// have to use function here to extract the 'this' scope from the helper loader
module.exports = (njk: Environment) =>
  function (this: typeof Template, modelPath: string, options: ExtendOptions) {
    const modelFilePath = join(dirname(this.env.globals.currentFilePointer), modelPath);
    const modelFile = resolve(modelFilePath);

    const content = readFileSync(modelFile, 'utf8');
    const modelObject = jsYaml.load(njk.renderString(content, {})) as Record<string, any>;

    (options?.require || []).forEach((requiredKey) => required(modelObject, requiredKey, true));
    (options?.optional || []).forEach((optionalKey) => required(modelObject, optionalKey, false));
    (options?.omit || []).forEach((omitKey) => deleteNested(modelObject, omitKey));
    (options?.include || []).forEach(([includeKey, def]) => setNested(modelObject, includeKey, def));

    return jsYaml.dump(modelObject);
  };
