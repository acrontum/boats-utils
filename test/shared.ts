import { ChildProcess, exec as execCb } from 'node:child_process';
import { rm, readFile, readdir } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execCb);

export interface AsyncProcess {
  proc: ChildProcess;
  promise: Promise<string>;
  resolve: (stdout: string) => void;
  reject: (err: any) => void;
}

export const boatsFixtureFolder = async (folder: string): Promise<Record<string, any>> => {
  await rm(resolve('test/.boats'), { recursive: true, force: true });
  delete require.cache[resolve('test/.boats/api_0.json')];

  const helpers = (await readdir('dist/src')).reduce((jsHelpers: string[], file: string) => {
    if (extname(file) === '.js') {
      jsHelpers.push(`-f dist/src/${file}`);
    }

    return jsHelpers;
  }, []);

  await exec(`\
    NODE_ENV=test node node_modules/boats/bin/cli.js \
      ${helpers.join(' ')} \
      -i test/fixtures/${folder}/src/index.yml \
      -o test/.boats/api.json
  `);

  return JSON.parse(await readFile('test/.boats/api_0.json', { encoding: 'utf8' }));
};
